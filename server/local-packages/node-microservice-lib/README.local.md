# Local server library

This is a partial reconstruction of @wf/node-microservice-lib 7.0.3 from the source
snippets supplied for this project. It is intended for local no-auth development,
not as a replacement for the original library in production. The declarations
describe this local subset and are not copied upstream declarations.

Implemented: createApp, createLogger, readPackageJson, four empty-success no-auth
routes, client log validation/sanitization, JSON environment overrides, environment
JavaScript download and temporary-file cleanup, static serving, and the supplied
Helmet/CSP settings. Public runtime exports are limited to the three functions the
application imports. No-auth does not supply a mock authenticated user or tokens.

Authentication, sessions, Redis, APM initialization, Venafi, feature flags, and
configuration service integration are not reconstructed. Enabling these features
throws an explicit startup error. SharedData and AppData are not exposed or
implemented because no supported handler needs them.

WEB_APP_ROOT must be absolute for the environment endpoints. The consuming app
resolves its configured relative path against its working directory before startup.
PATH_TO_ENV_PROPERTIES defaults to /json/env-properties.json and determines both
the route and the file suffix inside WEB_APP_ROOT. Only existing top-level JSON
keys are overridden, using nonempty environment values as strings.

The JavaScript download preserves the supplied attachment behavior. Two small
error-path fixes remove partial files after write errors and finish failed downloads
with HTTP 500 when response headers have not been sent.

The framework /clientlogs route runs before the application's duplicate route,
matching the supplied createApp middleware order. It caps severity at warn and
sanitizes messages to 2000 characters, with recursive parameter sanitization.

From the repository root:

- `npm.cmd --prefix server run test:wf` tests the reconstructed library.
- `npm.cmd --prefix server test -- --runInBand` tests server integration/controllers.
- `npm.cmd run build:server` builds and installs the packaged runtime under public.
- `npm.cmd run dev` builds the client and starts server/client/reload watchers.

The webpack build copies this package into public/local-packages so the file
dependency remains valid when public/package.json is installed.
