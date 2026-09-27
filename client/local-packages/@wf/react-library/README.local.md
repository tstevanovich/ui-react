# Local application substitute

This folder contains a partial local implementation for the current `client/src/App.tsx`.
It is not the original Orchestra library implementation. The original copied manifest
is preserved in `package.original.json`; the active manifest describes this private
local substitute and only its required peer dependencies.

## Implemented runtime files

- `dist/utils/CommonUtils.js`: `isNotEmpty` checks for a nonempty string.
- `dist/hooks/useConfig.js`: loads `/json/env-properties.json`; `publicPath` changes
  the base path, `fallback` displays while loading, and `async=true` renders children
  with an empty environment until loading completes.
- `dist/components/template/Template.component.js`: local consumer-style header,
  flat desktop/mobile navigation, browser routing, skip link, and default footer.

The template uses the structure and footer text provided from the original
`uo`, `co`, `lo`, `bi`, `yi`, `ri`, `ni`, `ei`, `ti`, and `ii` functions.
The original theme constants, fonts, header SVG, and mobile drawer implementation
were not available. Colors and typography are approximations; the existing app
icon and a simple mobile menu substitute for those assets/components.

Only the current application's UI behavior is implemented. Other themes,
authorization, session handling, nested/side navigation, alternate footer modes,
route loaders/actions, and logging are not implemented. Privacy and Orchestra
links preserve the supplied destinations, including the internal Orchestra URL.

## Current integration status

The client installs this package using `file:local-packages/@wf/react-library`.
`dist/index.js` exports the working Template, configuration provider/hook, and
isNotEmpty utility; `dist/index.d.ts` exports their declarations and supporting types.
The package uses ES modules, TypeScript uses bundler resolution, and Jest transforms
the local JavaScript for its CommonJS test environment.

For client-only development, from the repository root:

```sh
npm.cmd --prefix client start -- --no-open
```

Open http://localhost:3000. The full root `npm.cmd run dev` command uses the reconstructed
server library and serves the application at http://localhost:8080.

The application route table is `client/src/app/routes.tsx`. Template uses route matching
for page titles, including parameterized paths and the app-provided not-found route.
The configuration hook exposes environment values as `Record<string, unknown>` so
application code validates values before use.

## Focused checks

From `client`, using Node 24:

```sh
npm.cmd run test:wf
npm.cmd run test:local -- --runInBand
npm.cmd run build:local
```

The template tests check rendered content and interaction in jsdom. The application
integration test renders App through the real installed package. Production and
development builds and desktop/mobile checks of the production output in headless
Edge were also performed during integration. Theme/branding fidelity to the original
application is still unverified.
