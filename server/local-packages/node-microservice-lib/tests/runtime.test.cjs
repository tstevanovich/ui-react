const { test, beforeEach, afterEach } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const request = require('supertest');
const { createApp, createLogger, readPackageJson } = require('..');

const envKeys = ['WEB_APP_ROOT', 'ROOT_URL', 'PATH_TO_ENV_PROPERTIES', 'LOCAL_TEST_VALUE', 'LOCAL_TEST_EMPTY'];
let savedEnv;
let fixture;
const config = { isWebApp: true, appId: 'local-test', cin: 'test-cin', appEnv: 'test' };
createLogger().silent = true;

beforeEach(() => {
  savedEnv = Object.fromEntries(envKeys.map(key => [key, process.env[key]]));
  envKeys.forEach(key => delete process.env[key]);
  fixture = fs.mkdtempSync(path.join(os.tmpdir(), 'wf-server-test-'));
  fs.mkdirSync(path.join(fixture, 'json'));
  fs.writeFileSync(path.join(fixture, 'index.html'), '<!doctype html><title>Local client</title>');
  fs.writeFileSync(path.join(fixture, 'json', 'env-properties.json'), JSON.stringify({
    LOCAL_TEST_VALUE: 'from-file', LOCAL_TEST_EMPTY: 'keep-file-value', nested: { value: true },
  }));
  process.env.WEB_APP_ROOT = fixture;
});

afterEach(() => {
  for (const [key, value] of Object.entries(savedEnv)) {
    if (value === undefined) delete process.env[key];
    else process.env[key] = value;
  }
  // fixture is the dedicated absolute directory created by mkdtemp above.
  fs.rmSync(fixture, { recursive: true, force: true });
});

test('all four no-auth endpoints return empty success under ROOT_URL', async () => {
  process.env.ROOT_URL = '/example';
  const app = await createApp(config);
  for (const route of ['applogin', 'logout', 'refreshToken', 'keepalive']) {
    const response = await request(app).get(`/example/auth/${route}`).expect(200);
    assert.deepEqual(response.body, {});
    assert.equal(response.headers['set-cookie'], undefined);
  }
  await request(app).get('/auth/applogin').expect(404);
});

test('environment JSON replaces existing keys with nonempty strings only', async () => {
  process.env.LOCAL_TEST_VALUE = 'false';
  process.env.LOCAL_TEST_EMPTY = '';
  const app = await createApp(config);
  const response = await request(app).get('/json/env-properties.json').expect(200);
  assert.deepEqual(response.body, {
    LOCAL_TEST_VALUE: 'false', LOCAL_TEST_EMPTY: 'keep-file-value', nested: { value: true },
  });
  assert.equal(response.body.WEB_APP_ROOT, undefined);
});

test('custom JSON file suffix and route work beneath ROOT_URL', async () => {
  process.env.ROOT_URL = '/example';
  process.env.PATH_TO_ENV_PROPERTIES = '/json/custom.json';
  fs.writeFileSync(path.join(fixture, 'json', 'custom.json'), '{"custom":true}');
  const app = await createApp(config);
  const response = await request(app).get('/example/json/custom.json').expect(200);
  assert.deepEqual(response.body, { custom: true });
});

test('environment endpoint reports malformed JSON, missing files, and relative roots', async () => {
  const app = await createApp(config);
  const jsonPath = path.join(fixture, 'json', 'env-properties.json');
  fs.writeFileSync(jsonPath, '{broken');
  assert.equal(typeof (await request(app).get('/json/env-properties.json').expect(500)).body.error, 'string');
  fs.unlinkSync(jsonPath);
  await request(app).get('/json/env-properties.json').expect(500);
  process.env.WEB_APP_ROOT = './relative';
  const response = await request(app).get('/json/env-properties.json').expect(500);
  assert.equal(response.body.error, 'Invalid path to fetch env-properties.json');
});

test('JavaScript download contains overrides and removes its temporary file', async (t) => {
  process.env.LOCAL_TEST_VALUE = 'download-value';
  let downloadedFile;
  const originalWriteFile = fs.writeFile;
  t.mock.method(fs, 'writeFile', function (filename, ...args) {
    downloadedFile = filename;
    return originalWriteFile.call(this, filename, ...args);
  });
  const app = await createApp(config);
  const response = await request(app).get('/assets/env-properties.js').expect(200);
  assert.match(response.headers['content-type'], /javascript/);
  assert.match(response.headers['content-disposition'], /attachment; filename="env-properties.js"/);
  assert.match(response.text, /^window\['INJECT'\] = /);
  const properties = JSON.parse(response.text.slice("window['INJECT'] = ".length, -1));
  assert.equal(properties.LOCAL_TEST_VALUE, 'download-value');
  assert.ok(downloadedFile);
  // unlink runs asynchronously from the download completion callback.
  for (let retry = 0; retry < 50 && fs.existsSync(downloadedFile); retry++) {
    await new Promise(resolve => setTimeout(resolve, 10));
  }
  assert.equal(fs.existsSync(downloadedFile), false);
});

test('JavaScript download finishes with HTTP 500 when temporary-file writing fails', async (t) => {
  t.mock.method(fs, 'writeFile', (filename, content, options, callback) => callback(new Error('test write failure')));
  const app = await createApp(config);
  const response = await request(app).get('/assets/env-properties.js').expect(500);
  assert.equal(response.text, 'Error writing file');
});

test('static content preserves supplied CSP and no-store headers', async () => {
  const app = await createApp({ ...config, csp: { additionalSources: {
    ALL: ['https://shared.example'], script: ['https://scripts.example'], connect: ['ws://localhost:35729'],
  } } });
  const response = await request(app).get('/').expect(200);
  assert.match(response.text, /Local client/);
  assert.equal(response.headers['cache-control'], 'no-store');
  assert.equal(response.headers['x-frame-options'], 'DENY');
  assert.equal(response.headers['x-content-type-options'], 'nosniff');
  assert.equal(response.headers['x-powered-by'], undefined);
  const csp = response.headers['content-security-policy'];
  assert.match(csp, /default-src 'none'/);
  assert.match(csp, /https:\/\/\*\.wellsfargo\.com/);
  assert.match(csp, /https:\/\/\*\.ff\.harness\.io/);
  assert.match(csp, /script-src [^;]*https:\/\/scripts\.example/);
  assert.match(csp, /connect-src [^;]*ws:\/\/localhost:35729/);
});

test('client logs sanitize message, nested parameters, and cap severity at warn', async (t) => {
  const logger = createLogger();
  const calls = [];
  t.mock.method(logger, 'warn', (...args) => calls.push(args));
  const app = await createApp(config);
  const response = await request(app).post('/clientlogs').send({
    logLevel: 99, logMsg: 'first\nsecond\u0001' + 'x'.repeat(2100),
    params: { 'a\nb': ['line\rbreak', { nested: 'bad\u0002value' }, 42, null] },
  }).expect(200);
  assert.deepEqual(response.body, { success: true });
  assert.equal(calls.length, 1);
  assert.equal(calls[0][0].length, '[CLIENT] '.length + 2000);
  assert.ok(calls[0][0].startsWith('[CLIENT] first second'));
  assert.deepEqual(calls[0][1], { 'a b': ['line break', { nested: 'badvalue' }, 42, null] });
});

test('client logs retain original level mapping and missing-body errors', async (t) => {
  const calls = [];
  for (const level of ['debug', 'info', 'warn']) {
    t.mock.method(createLogger(), level, () => calls.push(level));
  }
  const app = await createApp(config);
  calls.length = 0;
  for (const [input, expected] of [[0, 'debug'], [1, 'debug'], [2, 'info'], [3, 'warn'], ['3', 'debug'], [-1, 'debug'], [1.5, 'debug']]) {
    await request(app).post('/clientlogs').send({ logLevel: input, logMsg: 'message' }).expect(200);
    assert.equal(calls.pop(), expected);
  }
  const empty = await request(app).post('/clientlogs').send({}).expect(500);
  assert.equal(empty.body.errorMessage, 'Missing or empty Request Body');
  const missing = await request(app).post('/clientlogs').send({ logLevel: 2 }).expect(500);
  assert.equal(missing.body.errorMessage, 'Missing log message in Request');
});

test('unsupported services fail explicitly instead of silently disabling them', async () => {
  for (const value of [
    { auth: {} }, { elastic: {} }, { redisConfig: {} }, { sessionConfig: {} },
    { venafiCertificateConfig: { enabled: true } }, { featureFlags: { enabled: true } },
    { configService: { configCacheEnabled: true } },
  ]) {
    await assert.rejects(createApp({ ...config, ...value }), /Unsupported configuration/);
  }
  fs.unlinkSync(path.join(fixture, 'index.html'));
  await assert.rejects(createApp(config), /Invalid path for public\/client/);
});

test('package JSON prefers build file, falls back to dev, and rejects invalid JSON', () => {
  const build = path.join(fixture, 'build.json');
  const dev = path.join(fixture, 'dev.json');
  fs.writeFileSync(dev, '{"name":"dev"}');
  assert.deepEqual(readPackageJson(build, dev), { name: 'dev' });
  fs.writeFileSync(build, '{"name":"build"}');
  assert.deepEqual(readPackageJson(build, dev), { name: 'build' });
  fs.writeFileSync(build, 'broken');
  assert.throws(() => readPackageJson(build, dev), /not valid JSON/);
  assert.equal(createLogger().defaultMeta.WF_CIN, 'test-cin');
});
