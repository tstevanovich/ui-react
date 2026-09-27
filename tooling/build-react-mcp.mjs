import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { build } from 'esbuild';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const source = JSON.parse(await fs.readFile(new URL('./react-mcp-source.json', import.meta.url)));
const cache = path.join(root, '.cache/react-mcp', source.commit);
const archive = path.join(cache, 'source.tar.gz');
await fs.mkdir(cache, { recursive: true });
try {
  await fs.access(archive);
} catch {
  if (!process.argv.includes('--download')) {
    throw new Error(
      'React source archive is missing. Run npm run mcp:setup:react -- --download on a connected machine, or copy the pinned source.tar.gz into ' +
        cache
    );
  }
  const response = await fetch(`https://codeload.github.com/react/react/tar.gz/${source.commit}`, {
    signal: AbortSignal.timeout(60_000)
  });
  if (!response.ok) throw new Error(`React source download failed: HTTP ${response.status}`);
  const bytes = Buffer.from(await response.arrayBuffer());
  if (createHash('sha256').update(bytes).digest('hex') !== source.archiveSha256) {
    throw new Error('Downloaded React archive checksum does not match the pinned source.');
  }
  await fs.writeFile(archive, bytes);
}
const bytes = await fs.readFile(archive);
if (createHash('sha256').update(bytes).digest('hex') !== source.archiveSha256) {
  throw new Error('Cached React archive checksum does not match the pinned source.');
}

const prefix = `react-${source.commit}`;
execFileSync(
  'tar',
  [
    '-xf',
    archive,
    '-C',
    cache,
    `${prefix}/compiler/packages/react-mcp-server`,
    `${prefix}/compiler/packages/babel-plugin-react-compiler/src`,
    `${prefix}/LICENSE`
  ],
  { stdio: 'inherit', windowsHide: true }
);
const packages = path.join(cache, prefix, 'compiler/packages');
const output = path.join(root, '.cache/react-mcp/dist');
await fs.mkdir(output, { recursive: true });
await build({
  entryPoints: [path.join(packages, 'react-mcp-server/src/index.ts')],
  outfile: path.join(output, 'index.cjs'),
  absWorkingDir: root,
  bundle: true,
  platform: 'node',
  format: 'cjs',
  target: 'node24',
  // esbuild transpiles the official source; it does not need the upstream TS workspace.
  tsconfigRaw: { compilerOptions: { esModuleInterop: true } },
  packages: 'external',
  alias: {
    'babel-plugin-react-compiler/src': path.join(
      packages,
      'babel-plugin-react-compiler/src/index.ts'
    )
  },
  banner: {
    js: `// Official experimental React MCP, built from ${source.commit}. See LICENSE.`
  }
});
await fs.copyFile(path.join(cache, prefix, 'LICENSE'), path.join(output, 'LICENSE'));
await fs.writeFile(path.join(output, 'source.json'), JSON.stringify(source, null, 2) + '\n');
console.log(`Built official experimental React MCP from ${source.commit}.`);
