import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const { servers } = JSON.parse(fs.readFileSync(path.join(root, '.vscode/mcp.json'), 'utf8'));
const online = process.argv.includes('--online');
const names = process.argv.slice(2).filter((arg) => arg !== '--online');
for (const name of names) {
  if (!servers[name]) throw new Error(`Unknown MCP server: ${name}`);
}

async function call(client, name, args, expectedText) {
  const result = await client.callTool({ name, arguments: args }, undefined, { timeout: 60_000 });
  const text = result.content
    .filter((item) => item.type === 'text')
    .map((item) => item.text)
    .join('\n');
  if (result.isError || (expectedText && !text.includes(expectedText))) {
    throw new Error(`${name} failed: ${text.slice(0, 500)}`);
  }
  return text;
}

for (const [name, server] of Object.entries(servers)) {
  if (names.length && !names.includes(name)) continue;
  const client = new Client({ name: 'project-mcp-check', version: '1.0.0' });
  const transport =
    server.type === 'http'
      ? new StreamableHTTPClientTransport(new URL(server.url))
      : new StdioClientTransport({
          command: process.execPath,
          args: server.args.map((arg) => arg.replace('${workspaceFolder}', root)),
          cwd: root,
          ...(server.env ? { env: { ...process.env, ...server.env } } : {})
        });
  try {
    await client.connect(transport, { timeout: 20_000 });
    const result = await client.listTools({}, { timeout: 20_000 });
    if (!result.tools.length) throw new Error('No tools returned');
    console.log(`${name}: connected, ${result.tools.length} tools available`);
    if (name === 'playwright') {
      const result = await client.callTool({
        name: 'browser_navigate',
        arguments: { url: 'about:blank' }
      });
      if (result.isError) throw new Error(JSON.stringify(result.content));
      await client.callTool({ name: 'browser_close', arguments: {} });
      console.log('playwright: isolated browser launch and close passed');
    }
    if (name === 'react') {
      await call(
        client,
        'compile',
        { text: 'export default function Greeting({ name }) { return <h1>Hello {name}</h1>; }' },
        'Greeting'
      );
      console.log('react: local compiler tool passed');
      if (online) {
        await call(client, 'query-react-dev-docs', { query: 'useState' }, 'useState');
        console.log('react: external documentation lookup passed');
      }
    }
    if (name === 'mui' && online) {
      // The official server registers useMuiDocs after its background catalog request.
      const deadline = Date.now() + 30_000;
      let tools = result.tools;
      while (!tools.some((tool) => tool.name === 'useMuiDocs') && Date.now() < deadline) {
        await new Promise((resolve) => setTimeout(resolve, 500));
        tools = (await client.listTools({}, { timeout: 5000 })).tools;
      }
      if (!tools.some((tool) => tool.name === 'useMuiDocs')) {
        throw new Error('MUI documentation catalog was not available within 30 seconds.');
      }
      const index = await call(
        client,
        'useMuiDocs',
        { sources: ['@mui/material@6.5.0'] },
        'https://'
      );
      const buttonUrl = index.match(/https:\/\/[^\s)"<>]*\/button(?:s|\.md)[^\s)"<>]*/)?.[0];
      if (!buttonUrl) throw new Error('MUI 6.5.0 catalog did not contain Button documentation.');
      await call(client, 'fetchDocs', { urls: [buttonUrl] }, 'Button');
      console.log('mui: Material UI 6.5.0 catalog and Button documentation passed');
    }
  } catch (error) {
    console.error(`${name}: ${error.message}`);
    process.exitCode = 1;
  } finally {
    await client.close();
  }
}
if (!online) {
  console.log('Documentation requests were not tested. Use --online to test external access.');
  console.log('MUI may contact its catalog backend during startup even without --online.');
}
