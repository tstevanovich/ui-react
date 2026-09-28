# Development guide

This is a local React 19, TypeScript, MUI, and webpack application with an Express 5
server. The WF Template remains the application shell. The local WF packages are
reconstructed subsets; this setup is ready for local feature development, not a
claim of production authentication or complete upstream-library compatibility.

## Install and run

Use Node 24. Open the repository root in VS Code. On Windows, `npm.cmd` works even
when PowerShell blocks the `npm.ps1` wrapper. The equivalent command elsewhere is `npm`.

For a clean checkout, install each locked dependency tree:

```powershell
npm.cmd ci --ignore-scripts
npm.cmd --prefix client ci --ignore-scripts
npm.cmd --prefix server ci --ignore-scripts
```

The root's older `install` lifecycle script installs the child packages automatically
with `npm install`. Using the explicit `ci` commands above preserves all three locks.
Shared lint/format tooling lives at the root; client and server retain their build/test
dependencies. Change the appropriate manifest and lock together when adding a package.

Copy `.env.example` to `.env` and `server/.env.example` to `server/.env` only if those
files do not already exist. Existing local values must be preserved.

```powershell
npm.cmd run dev
```

Open <http://localhost:8080>. This builds the client, starts the server, watches source,
and runs LiveReload. A client-only webpack server is also available with
`npm.cmd --prefix client start -- --no-open` at <http://localhost:3000>. Its mock auth
responses are separate from the real local server's empty no-auth responses.

## Daily checks

| Command from the root                       | Purpose                                                              |
| ------------------------------------------- | -------------------------------------------------------------------- |
| `npm.cmd run lint`                          | JavaScript/TypeScript, React hooks, accessibility, and test mistakes |
| `npm.cmd run lint:fix`                      | Apply available ESLint fixes                                         |
| `npm.cmd run lint:styles`                   | CSS/SCSS correctness and conventions                                 |
| `npm.cmd run format`                        | Apply the shared Prettier format                                     |
| `npm.cmd run format:check`                  | Verify formatting without edits                                      |
| `npm.cmd run typecheck`                     | Check client, server, and browser-test TypeScript                    |
| `npm.cmd test`                              | Client/server Jest tests plus reconstructed-library tests            |
| `npm.cmd run check`                         | All the preceding non-mutating quality checks                        |
| `npm.cmd run test:e2e`                      | Build and test the complete application on desktop/mobile            |
| `npm.cmd run mcp:setup:react -- --download` | Fetch verified upstream React MCP source and build locally           |
| `npm.cmd run mcp:check`                     | Check local MCP startup, React compilation, and browser launch       |
| `npm.cmd run mcp:check:online`              | Also verify external React and MUI documentation access              |

Run focused tests while working, for example:

```powershell
npm.cmd --prefix client run test:local -- --runInBand routes.test.tsx
npm.cmd --prefix server test -- --runInBand logger.controller.test.ts
npm.cmd --prefix client run test:watch
```

ESLint uses type information in application source to catch forgotten promises and
unsafe data access. Tests have a narrow exception for untyped mocks and Supertest
responses; production source does not. CommonJS build scripts are checked as JavaScript.
Prettier owns layout, so ESLint does not report formatting differences as code defects.
ESLint's simple-import-sort plugin groups and sorts ES module imports and exports
using its defaults. Explicitly saving a file applies sorting through the existing
ESLint save action; `npm.cmd run lint:fix` also applies it. Prettier still handles
formatting. CommonJS `require()` calls are not sorted by this plugin.
SCSS uses the standard SCSS Stylelint rules, disallows IDs and `!important`, and uses
hex/function colors instead of named colors. MUI `sx` objects are JavaScript and are
checked by TypeScript/ESLint, not Stylelint.
Recess ordering groups CSS/SCSS declarations consistently. The existing Stylelint
save action and `npm.cmd run lint:styles:fix` apply property-order fixes; Prettier
handles formatting. Generated `dist` directories and minified CSS are excluded.

Formatting uses two spaces, single quotes in JavaScript, semicolons, no trailing commas,
one attribute per line, 100-column wrapping, and LF line endings. Vendored assets, reconstructed local packages,
generated bundles/reports, lockfiles, and environment files are excluded from broad
formatting. Intentional package edits still require their separate tests.

## Where code belongs

| Location                                          | Responsibility                                                |
| ------------------------------------------------- | ------------------------------------------------------------- |
| `client/src/main.tsx`                             | Mount React and load environment configuration                |
| `client/src/App.tsx`                              | Assemble the WF Template's header/footer/application settings |
| `client/src/app/routes.tsx`                       | Route definitions, page titles, paths, navigation             |
| `client/src/home/`                                | Home page and its tests                                       |
| `client/src/app/NotFound.tsx`                     | Recovery UI for an unknown URL                                |
| `client/src/assets/stylesheets/app.scss`          | Global stylesheet rules                                       |
| `server/src/app.ts`                               | Construct/configure Express without opening a listening port  |
| `server/src/index.ts`                             | Start the server process                                      |
| `server/src/routes/` and `server/src/controller/` | HTTP routes and request handling                              |
| `tests/tests/`                                    | Browser and complete-server checks                            |

Add a feature folder under `client/src` when a real feature needs one. Keep its page,
components, hooks, and tests together. Extract shared UI only when another feature
needs it. There is no need to create empty services/stores/hooks folders in advance.

## Routing with WF Template

The Template creates BrowserRouter, so App supplies routes rather than creating
another router. Add a path constant and a route in `client/src/app/routes.tsx`, then
add a navigation item only if the page belongs in the menu. Example for a future page:

```tsx
{ name: 'Profile', path: '/profile', title: 'Profile | Orchestra React', element: <Profile /> }
```

Use React Router's `Link` or MUI `Link` with `component={RouterLink}` for in-app
navigation. Ordinary anchors are appropriate for external destinations. The local
Template supports flat paths, parameters such as `/items/:itemId`, and the `*` fallback.
It updates the title using route matching. Nested layouts, loaders/actions, and auth
guards are not implemented by this reconstructed Template.

The Express fallback and webpack's history fallback allow a direct URL or refresh
to return the app. An unknown route displays the app's not-found UI; it is still a
client-rendered page, not a server-side HTTP 404 response. Test refresh, back navigation,
and unknown paths when adding routes. See [React Router's routing guide](https://reactrouter.com/start/declarative/routing).

## Tests that prove behavior

- Component tests use React Testing Library and `user-event`: find controls by role
  and accessible name, perform an interaction, and assert what the user sees.
- Integration tests exercise App with the real local Template/provider and Express
  with the real local server library. Avoid replacing the subject under test with a mock.
- Node test-runner suites exercise the reconstructed WF runtime independently.
- Playwright builds the app and starts a dedicated server on port 4180. It never reuses
  the developer's 8080 server. Windows uses installed Edge; on another OS install the
  test browser with `npx playwright install chromium`. `test:e2e:ui` requires a prior build.

Jest enforces 80% statements/lines/functions and 70% branches for owned application
source. Bootstrap/process entrypoints are excluded from percentage gates and covered
by startup/browser checks. Coverage measures which paths ran; it does not prove that
assertions are meaningful. Do not add tests that merely repeat implementation details.
See [Testing Library's principles](https://testing-library.com/docs/guiding-principles/).

The former HyperExecute helper is retained as an unused remote-integration reference.
The default tests do not contact internal work domains or require remote credentials.
The GitHub repository is [tstevanovich/ui-react](https://github.com/tstevanovich/ui-react).
No CI workflow is configured; `npm run check` and `npm run test:e2e` are the commands
a future CI workflow should execute.

## VS Code

The repository recommends ESLint, Prettier, Stylelint, Jest, Playwright, Codex, and
Copilot. VS Code includes TypeScript support; use **TypeScript: Select TypeScript
Version > Use Workspace Version**. Save formats and applies lint fixes. The Test
Explorer has separate client/server Jest configurations and runs tests on demand.
Use **Tasks: Run Task** for quality checks or starting development.

Copilot is bundled with this installed VS Code version. Its account sign-in and model
selection remain in the VS Code UI. Existing unrelated extensions are left installed.
The installed Vitest extension is unnecessary for this Jest project, but does not
need to be removed globally to use another project.

Start with [the React learning path](REACT-LEARNING.md) and [AI workflow](AI-WORKFLOW.md).
