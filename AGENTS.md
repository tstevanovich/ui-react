# Project working agreements

This is a React 19 + TypeScript + MUI app, built with webpack, with an Express 5
server. It is being prepared for development by a developer learning React.

## Decisions to preserve

- Keep the WF Template wrapper. It already owns BrowserRouter. Register pages in
  `client/src/app/routes.tsx`; do not add another BrowserRouter around App.
- Local WF packages are reconstructed subsets. Read their README.local.md before
  relying on a feature; a declaration does not prove runtime support. Authentication,
  remote feature flags, sessions, and full upstream parity are not implemented.
- npm is used with three lockfiles (root, client, server). Do not convert package
  managers or build tools as a side effect of a feature change.
- Run commands from the repository root. On Windows PowerShell use `npm.cmd`
  when npm.ps1 is blocked. Node 24 is the configured development baseline.
- Preserve the developer's running server and existing uncommitted work. E2E has
  its own port, 4180; do not stop the app on 8080 to run tests.

## Code and verification

- Root ESLint, Prettier, and Stylelint configurations are authoritative. Do not
  add parallel package-level formatting rules or broad rule suppressions.
- Use typed props, explicit request validation, and unknown for untrusted data.
  Prefer functional components, local state, and accessible semantic controls.
  Keep reusable UI separate from page routing; use MUI sx for component styling.
- Test observable behavior with React Testing Library/user-event or Supertest.
  Keep focused unit tests beside their source. Avoid snapshots of implementation
  details and mocking the component whose behavior is being tested.
- `npm run check` checks lint, styles, formatting, types, and all unit/library tests.
  Use focused checks while iterating, then the aggregate check for a completed change.
- `npm run build:server` and `npm run build:local:client` build without release stamping.
  After building, `npm run test:e2e` checks the built app on desktop and mobile.
- Generated public/dist/coverage output and local package copies are excluded from
  broad lint/format passes. Changes to reconstructed packages require their tests.
- Explain failed or skipped checks accurately; do not lower coverage gates to hide
  a regression. Update the development guide when changing commands or architecture.

## Teaching and AI tools

Explain the immediate React concept in plain language after a meaningful change,
using the actual file as the example. Explain why a hook or abstraction is needed;
do not introduce a pattern just to demonstrate it. Offer a small learning exercise
when useful, without making it a prerequisite for finishing requested work.

Read `docs/DEVELOPMENT.md` for workflow and `docs/AI-WORKFLOW.md` for reusable prompts
and MCP usage. For library questions, check repository documentation and installed
package types/source first, then configured internal documentation services. Use
external documentation services only as an explicitly enabled fallback when local
and internal sources are insufficient. Match examples to installed library versions;
report missing documentation rather than silently assuming the latest API applies.
Use Playwright for observable browser behavior. Do not send source files, environment
files, tokens, or internal configuration to external documentation services.

## Code review rules

Check behavior, accessibility, request validation, route refresh/back navigation,
error/loading paths, and test quality. Flag use of unsupported WF runtime features.
Report concrete findings with file locations; separate confirmed bugs from questions.
