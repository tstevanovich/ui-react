'use strict';

// Local reconstruction of the supplied no-auth handlers; not the full WF library.
const cors = require('cors');
const express = require('express');
const helmet = require('helmet');
const morgan = require('morgan');
const winston = require('winston');
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const crypto = require('node:crypto');

require('dotenv').config();
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.json(),
  transports: [new winston.transports.Console({
    format: process.env.NODE_ENV === 'production'
      ? winston.format.combine(winston.format.timestamp(), winston.format.json())
      : winston.format.simple(),
  })],
});

function createLogger() {
  return logger;
}

function readPackageJson(buildModePath, devModePath) {
  let contents;
  try {
    contents = fs.readFileSync(buildModePath, 'utf8');
  } catch {
    logger.debug(`package.json is not found at ${buildModePath}, trying to find in ${devModePath}.`);
    contents = fs.readFileSync(devModePath, 'utf8');
  }
  try {
    return JSON.parse(contents);
  } catch (error) {
    throw new Error('The package.json file is not valid JSON.' + error);
  }
}

const CLIENT_LOG_MAX_LENGTH = 2000;
const CLIENT_LOG_MAX_LEVEL = 3;

function sanitizeForLog(input) {
  return String(input ?? '')
    .replace(/[\r\n]/g, ' ')
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, '')
    .slice(0, CLIENT_LOG_MAX_LENGTH);
}

function sanitizeParamsForLog(input) {
  if (typeof input === 'string') return sanitizeForLog(input);
  if (Array.isArray(input)) return input.map(sanitizeParamsForLog);
  if (input && typeof input === 'object') {
    return Object.fromEntries(Object.entries(input).map(([key, value]) => [
      sanitizeForLog(key), sanitizeParamsForLog(value),
    ]));
  }
  return input;
}

async function clientLogsHandler(req, res) {
  try {
    const logObj = req.body;
    if (logObj == null || Object.keys(logObj).length === 0) {
      throw new Error('Missing or empty Request Body');
    }
    if (logObj.logMsg == null) throw new Error('Missing log message in Request');
    const logLevel = typeof logObj.logLevel === 'number' ? logObj.logLevel : 0;
    const message = `[CLIENT] ${sanitizeForLog(logObj.logMsg)}`;
    const params = logObj.params != null ? sanitizeParamsForLog(logObj.params) : undefined;
    const level = Math.max(0, Math.min(Number(logLevel) || 0, CLIENT_LOG_MAX_LEVEL));
    switch (level) {
      case 2: logger.info(message, params); break;
      case 3: logger.warn(message, params); break;
      default: logger.debug(message, params);
    }
    res.status(200).json({ success: true });
  } catch (error) {
    logger.error(error.message);
    res.status(500).json({ errorMessage: error.message });
  }
}

function getEnvProperties() {
  const webAppRoot = process.env.WEB_APP_ROOT;
  if (!webAppRoot) return undefined;
  // The override is relative to WEB_APP_ROOT even when it starts with a slash.
  const resourcePath = (webAppRoot + (process.env.PATH_TO_ENV_PROPERTIES || '/json/env-properties.json'))
    .replace(/\/+/g, '/').replace(/\\+/g, '\\');
  const envPropertiesPath = path.resolve(__dirname, resourcePath);
  try {
    const properties = JSON.parse(fs.readFileSync(envPropertiesPath, 'utf8'));
    for (const key in properties) {
      if (process.env[key]) properties[key] = process.env[key];
    }
    return properties;
  } catch (error) {
    logger.error(`Error reading or parsing ${envPropertiesPath}:`, error);
    throw error;
  }
}

async function envPropertiesHandler(req, res) {
  if (!process.env.WEB_APP_ROOT || !path.isAbsolute(process.env.WEB_APP_ROOT)) {
    logger.error(`${process.env.WEB_APP_ROOT} is not a valid path.`);
    res.status(500).send({ error: 'Invalid path to fetch env-properties.json' });
    return;
  }
  try {
    res.json(await getEnvProperties());
  } catch (error) {
    logger.error(`Error in envPropertiesHandler: ${error.message}`);
    res.status(500).send({ error: error.message });
  }
}

async function envInjectionJavascriptHandler(req, res) {
  const displayName = 'env-properties.js';
  if (!process.env.WEB_APP_ROOT || !path.isAbsolute(process.env.WEB_APP_ROOT)) {
    logger.error(`${process.env.WEB_APP_ROOT} is not a valid path.`);
    res.status(500).send({ error: `Invalid path to fetch ${displayName}` });
    return;
  }
  const filename = path.join(os.tmpdir(), `env-properties-${crypto.randomBytes(16).toString('hex')}.js`);
  try {
    const properties = await getEnvProperties();
    const content = `window['INJECT'] = ${JSON.stringify(properties)};`;
    fs.writeFile(filename, content, { mode: 0o600 }, (error) => {
      if (error) {
        logger.error(error);
        // Remove a partial file if the write failed after creating it.
        fs.unlink(filename, () => {});
        res.status(500).send('Error writing file');
        return;
      }
      res.setHeader('Content-Type', 'text/javascript');
      res.download(filename, displayName, (downloadError) => {
        fs.unlink(filename, (unlinkError) => {
          if (unlinkError) logger.warn(unlinkError);
        });
        // Finish a failed response instead of leaving it hanging as in the snippet.
        if (downloadError && !res.headersSent) res.status(500).send('Error sending file');
      });
    });
  } catch (error) {
    logger.error(`Error in envInjectionJavascriptHandler: ${error.message}`);
    res.status(500).send({ error: error.message });
  }
}

function configureHelmetforWebApp(app, additional = {}) {
  const sources = [
    'https://*.wellsfargo.com',
    'https://*.wellsfargo.net',
    'https://*.eum-appdynamics.com/*',
    'https://cdn.appdynamics.com/*',
    ...(additional.ALL ?? []),
  ];
  app.use(helmet.contentSecurityPolicy({ directives: {
    defaultSrc: ["'none'"],
    scriptSrc: ["'self'", ...sources, ...(additional.script ?? [])],
    scriptSrcAttr: sources,
    styleSrc: ["'self'", "'unsafe-inline'", ...sources, ...(additional.style ?? [])],
    imgSrc: ["'self'", 'data:', ...sources, ...(additional.img ?? [])],
    connectSrc: ["'self'", 'https://*.ff.harness.io', ...sources, ...(additional.connect ?? [])],
    fontSrc: ["'self'", ...sources, ...(additional.font ?? [])],
    frameSrc: ["'self'", ...sources, ...(additional.frame ?? [])],
    frameAncestors: ["'none'"],
    formAction: ["'self'", ...sources, ...(additional.formAction ?? [])],
    baseUri: ["'self'"],
    manifestSrc: ["'self'"],
  } }));
  app.use(helmet.hidePoweredBy());
  app.use(helmet.frameguard({ action: 'deny' }));
  app.use(helmet.hsts({ maxAge: 31536000 }));
  app.use(helmet.noSniff());
}

async function createApp(config) {
  const unsupported = [
    ['auth', config.auth],
    ['elastic', config.elastic],
    ['redisConfig', config.redisConfig],
    ['sessionConfig', config.sessionConfig],
    ['venafiCertificateConfig', config.venafiCertificateConfig?.enabled],
    ['featureFlags', config.featureFlags?.enabled],
    ['configService', config.configService?.configCacheEnabled],
  ].filter(([, enabled]) => enabled).map(([name]) => name);
  if (unsupported.length) {
    throw new Error(`The local @wf/node-microservice-lib supports no-auth operation only. Unsupported configuration: ${unsupported.join(', ')}.`);
  }
  logger.defaultMeta = { WF_CIN: config.cin || config.appId };
  const app = express();
  const rootUrl = process.env.ROOT_URL || '/';
  app.use(express.json(config.jsonParserOptions));
  app.use(helmet());
  app.use(morgan('combined'));
  app.use(cors());

  if (config.isWebApp === true) {
    const noAuthRoutes = express.Router();
    for (const route of ['applogin', 'logout', 'refreshToken', 'keepalive']) {
      noAuthRoutes.get(`/auth/${route}`, (req, res) => res.status(200).json({}));
    }
    app.use(rootUrl, noAuthRoutes);
  }
  const frameworkRouter = express.Router();
  frameworkRouter.post('/clientlogs', clientLogsHandler);
  frameworkRouter.get(process.env.PATH_TO_ENV_PROPERTIES || '/json/env-properties.json', envPropertiesHandler);
  frameworkRouter.get('/assets/env-properties.js', envInjectionJavascriptHandler);
  app.use(rootUrl, frameworkRouter);

  if (config.isWebApp === true) {
    const webAppRoot = process.env.WEB_APP_ROOT || './client';
    const indexPath = path.resolve(webAppRoot, 'index.html');
    if (!fs.existsSync(indexPath)) {
      throw new Error(`Invalid path for public/client folder with index.html - ${indexPath}. Please check the WEB_APP_ROOT environment variable.`);
    }
    configureHelmetforWebApp(app, config.csp?.additionalSources ?? {});
    app.use('/', express.static(webAppRoot, {
      setHeaders: (res) => res.setHeader('Cache-Control', 'no-store'),
    }));
  }
  logger.debug(`---------->App ENV: ${config.appEnv}`);
  return app;
}

module.exports = { createApp, createLogger, readPackageJson };
