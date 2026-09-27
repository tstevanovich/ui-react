import fs from 'node:fs';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const entry = new URL('../.cache/react-mcp/dist/index.cjs', import.meta.url);
const metadata = new URL('../.cache/react-mcp/dist/source.json', import.meta.url);
const expected = JSON.parse(fs.readFileSync(new URL('./react-mcp-source.json', import.meta.url)));
if (!fs.existsSync(entry) || !fs.existsSync(metadata)) {
  console.error('React MCP is not built. Run npm run mcp:setup:react; see docs/AI-WORKFLOW.md.');
  process.exit(1);
}
const actual = JSON.parse(fs.readFileSync(metadata));
if (actual.commit !== expected.commit || actual.archiveSha256 !== expected.archiveSha256) {
  console.error('React MCP build is out of date. Run npm run mcp:setup:react.');
  process.exit(1);
}
require(fileURLToPath(entry));
