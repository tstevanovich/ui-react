# AI workflow

## Instructions versus prompts versus tools

`AGENTS.md` contains standing project decisions and check commands. Codex discovers
it automatically. `.github/copilot-instructions.md` links Copilot to the same rules.
Keep these concise and update them when a real architecture decision changes.
See [Codex instructions](https://developers.openai.com/codex/guides/agents-md).

Reusable skills live in `.agents/skills`. VS Code is configured to discover this
location, and Codex scans it natively. They describe how to handle a class of requests:

| Workflow        | Example request                                                             |
| --------------- | --------------------------------------------------------------------------- |
| `react-feature` | “Add a Help page through the WF Template and explain the routing changes.”  |
| `review-change` | “Review my current changes for bugs, accessibility, and missing tests.”     |
| `diagnose-test` | “Explain and fix the failing routes test without weakening its assertions.” |

In Codex, invoke `$react-feature`, `$review-change`, or `$diagnose-test`, or make the
corresponding request naturally. Copilot has matching `.github/prompts` wrappers for
Local-agent `/react-feature`, `/review-change`, and `/diagnose-test` commands. Newer
Agent Host sessions use skills rather than those legacy prompt files. You can always
attach the SKILL.md file explicitly if it is not listed in your current chat UI.
See [Codex skill discovery](https://developers.openai.com/codex/skills) and
[VS Code prompt files](https://code.visualstudio.com/docs/agent-customization/prompt-files).

A useful feature request includes the user behavior, expected errors/empty states,
and acceptance criteria. For example:

> Use react-feature to add a Help page at /help with a Home link. Keep the WF Template.
> Explain how the route becomes visible and test navigation, refresh, and the page title.

For explanation only:

> Explain client/src/App.tsx as if I am learning React. Trace the configuration from
> the JSON request to Template. Do not edit files. Give me one small exercise afterward.

## MCP servers

The default configuration runs three official MCP servers as local Node processes.
Local process does **not** mean offline documentation: React and MUI still make
external requests. No server uses npx or downloads packages automatically at startup.

| Server               | Local capability                                    | External dependencies                                                  |
| -------------------- | --------------------------------------------------- | ---------------------------------------------------------------------- |
| Playwright           | Inspect the local application using installed Edge  | Sites/resources visited by the browser                                 |
| React (experimental) | Compile a React example using the upstream compiler | Documentation search uses Algolia and react.dev                        |
| MUI                  | Run the official pinned MCP process                 | Fetches its documentation catalog at startup, then documentation pages |

VS Code/Copilot uses .vscode/mcp.json; Codex uses .codex/config.toml. Start Codex
from the repository root so its relative script paths resolve. Context7 and OpenAI
Docs are no longer registered by default. They can be added explicitly in personal
MCP settings when external documentation access is needed.

### Local and internal first

1. Read repository guides, existing examples, and installed package declarations/source.
2. Use an approved internal documentation service if the environment provides one.
3. Use the configured official React/MUI documentation tools when the first two
   sources are insufficient and the network allows it. Report unavailable sources
   instead of silently switching services or inventing APIs.

Match documentation to client/package.json: React 19.2.4, Material UI 6.5.0, and
MUI X 8.11.3. MUI's catalog supports @mui/material@6.5.0; pass that explicit version
rather than the unqualified package name, which selects the newest release. If
an exact MUI X version is unavailable, verify examples against installed types.
The React docs search is not pinned to this application's React version.

These servers are explicitly enabled external fallbacks, not a source of internal
WF documentation. Never send private source, environment files, tokens, or internal
configuration to their remote tools. Use MUI's useMuiDocs and fetchDocs tools for
public documentation. Do not use its remote generateReactCode tool for project code.
No internal backend URL is invented or configured here.

### Install and build once

Follow docs/DEVELOPMENT.md to install the three locked npm dependency trees. The
root lockfile includes @mui/mcp 0.1.6 and the React MCP build/runtime dependencies.
Application package versions are unchanged. Root installation uses --ignore-scripts
so it does not run the legacy child install lifecycle or download a Puppeteer browser.

React does not publish this experimental server to npm. We build unchanged upstream
React MCP and compiler source from commit d083ec1da1e5252abd3ddfdde6dfbc09701a2c51.
The source archive SHA-256 is recorded in tooling/react-mcp-source.json and verified
before extraction. The local esbuild adapter replaces upstream workspace resolution;
it does not add React Compiler to this application's webpack build. Puppeteer is
pinned to 25.12.0 to avoid the vulnerable archive dependency in upstream's 24.x range.

On a connected machine, explicitly download and build the pinned source:

```powershell
npm.cmd run mcp:setup:react -- --download
```

Subsequent builds use the cached archive with no source download:

```powershell
npm.cmd run mcp:setup:react
```

Node 24 and tar are required for the build (Windows includes tar.exe). Source and
compiled output live under .cache/react-mcp and are ignored by Git. The MIT license
is retained beside the generated bundle. A clean clone therefore needs this setup
step; server startup fails with instructions if the build is missing or stale.

For an internal machine with no GitHub access, provision the pinned source archive
at .cache/react-mcp/d083ec1da1e5252abd3ddfdde6dfbc09701a2c51/source.tar.gz through your
normal internal artifact channel, then run the cached build command. Dependencies
must also be available from your internal npm registry or a prepared npm cache.
A compatible prebuilt .cache/react-mcp/dist directory can instead be provisioned
with its index.cjs, LICENSE, and source.json alongside the locked root dependencies.

### Firewall behavior and limitations

- React documentation uses the public Algolia service and pages on react.dev.
  Its compile tool runs locally. Its component-tree tool additionally requires a
  separately configured debug browser on loopback port 9222 and a compatible React
  DevTools hook; we do not open or configure that browser automatically.
- The upstream React performance tool fetches React 18 and web-vitals from unpkg.com.
  It is unsuitable for measuring this React 19 app. Use project tests and Playwright
  for app validation; do not follow the experimental tool's suggestion to benchmark
  every change. Its performance and component-tree tools are not validated here.
- MUI fetches a catalog from <https://chat-backend.mui.com> at startup. Documentation
  commonly comes from llms.mui.com, mui.com, and versioned documentation hosts listed
  in that catalog. Local startup can succeed while documentation tools are unavailable.
  MUI_DOCS_BASE_URL can point to a compatible internal catalog backend if your
  organization supplies one; it is not a switch for reading a folder of Markdown,
  and the catalog's document URLs must also be internally reachable for offline use.
- External access depends on the work machine's proxy, certificates, and network
  rules. A successful check on this machine does not verify the work network.
- Local processes may still require your editor's normal MCP trust step. This setup
  does not restart VS Code, change user settings, or start/stop the app on port 8080.

### Verify the tools

```powershell
npm.cmd run mcp:check
npm.cmd run mcp:check:online
```

The first checks server startup/tool discovery, Playwright's isolated browser launch,
and a local React compilation. It is not an offline test: MUI loads its catalog in
background. The second also checks React documentation search and MUI 6.5.0 catalog
and Button documentation retrieval. Only generic public queries are sent.

To check one server: npm.cmd run mcp:check -- react, or npm.cmd run mcp:check -- mui --online.
These checks validate subprocesses, not whether the current chat session has loaded
the changed configuration. Use MCP: List Servers in VS Code to manage Copilot's
servers; a new Codex session loads its project configuration.

Upstream sources: [React MCP](https://github.com/react/react/tree/d083ec1da1e5252abd3ddfdde6dfbc09701a2c51/compiler/packages/react-mcp-server),
[MUI MCP setup](https://mui.com/material-ui/getting-started/mcp/),
[MUI backend configuration](https://github.com/mui/mui-x/blob/master/packages/x-agent-tools/src/config.ts),
and [Playwright MCP](https://github.com/microsoft/playwright-mcp).
