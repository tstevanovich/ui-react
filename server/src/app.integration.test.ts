import type { Express } from 'express';
import fs from 'fs';
import os from 'os';
import path from 'path';
import request from 'supertest';

describe('app with the real local WF package', () => {
  let fixture: string;
  let app: Express;
  const keys = [
    'WEB_APP_ROOT',
    'ROOT_URL',
    'PATH_TO_ENV_PROPERTIES',
    'AUTH_CLIENT_ID',
    'AUTH_CLIENT_SECRET'
  ];
  let saved: Record<string, string | undefined>;

  beforeAll(async () => {
    saved = Object.fromEntries(keys.map((key) => [key, process.env[key]]));
    keys.forEach((key) => delete process.env[key]);
    fixture = fs.mkdtempSync(path.join(os.tmpdir(), 'wf-app-integration-'));
    fs.mkdirSync(path.join(fixture, 'json'));
    fs.writeFileSync(
      path.join(fixture, 'index.html'),
      '<!doctype html><title>Integration client</title>'
    );
    fs.writeFileSync(path.join(fixture, 'json', 'env-properties.json'), '{"integration":true}');
    // Exercise app.ts normalization, not just an already absolute path.
    process.env.WEB_APP_ROOT = path.relative(process.cwd(), fixture);
    process.env.ROOT_URL = '/';
    process.env.PATH_TO_ENV_PROPERTIES = '/json/env-properties.json';
    const appPromise = jest.requireActual<typeof import('./app')>('./app').default;
    app = await appPromise();
  });

  afterAll(() => {
    for (const [key, value] of Object.entries(saved)) {
      if (value === undefined) delete process.env[key];
      else process.env[key] = value;
    }
    fs.rmSync(fixture, { recursive: true, force: true });
  });

  it('serves health, environment JSON, no-auth login, and SPA fallback', async () => {
    await request(app).get('/healthcheck').expect(200);
    const env = await request(app).get('/json/env-properties.json').expect(200);
    expect(env.body).toEqual({ integration: true });
    const login = await request(app).get('/auth/applogin').expect(200);
    expect(login.body).toEqual({});
    const page = await request(app).get('/client/route').expect(200);
    expect(page.text).toContain('Integration client');
    expect(path.isAbsolute(process.env.WEB_APP_ROOT!)).toBe(true);
  });

  it('uses the framework logger before the duplicate application logger route', async () => {
    const logger = jest
      .requireActual<typeof import('@wf/node-microservice-lib')>('@wf/node-microservice-lib')
      .createLogger();
    const warn = jest.spyOn(logger, 'warn').mockImplementation(() => logger);
    const error = jest.spyOn(logger, 'error').mockImplementation(() => logger);
    try {
      await request(app)
        .post('/clientlogs')
        .send({ logLevel: 4, logMsg: 'test\nmessage' })
        .expect(200);
      expect(warn).toHaveBeenCalledWith('[CLIENT] test message', undefined);
      expect(error).not.toHaveBeenCalled();
    } finally {
      warn.mockRestore();
      error.mockRestore();
    }
  });
});
