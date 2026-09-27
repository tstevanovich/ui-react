const path = require('node:path');

// Builds run explicitly before E2E; this process only serves the existing bundle.
process.env.WEB_APP_ROOT = path.resolve(__dirname, '../public/client');
process.env.PATH_TO_ENV_PROPERTIES = '/json/env-properties.json';
process.env.ROOT_URL = '/';
process.env.APP_ENV = 'test';
process.env.AUTH_CLIENT_ID = '';
process.env.AUTH_CLIENT_SECRET = '';
process.env.ENABLE_LIVE_RELOAD = 'false';
require('../public/index.js');
