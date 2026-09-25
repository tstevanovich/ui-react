import {
  OrchestraSessionConfigOptions,RedisConfig,
  WebAppConfig,WebAppAuthConfig,
  createApp,
  createLogger,
  readPackageJson,
} from "@wf/node-microservice-lib";
import apm from "elastic-apm-node";
import { NextFunction, Request, Response } from "express";
import path from "path";

import routes from "./routes";

require("dotenv").config({ path: path.resolve(__dirname, "../.env") });

const webAppRootEnv = process.env.WEB_APP_ROOT;
if (!webAppRootEnv) {
  throw new Error("Missing required WEB_APP_ROOT in environment (.env)");
}
const webAppRoot = path.resolve(process.cwd(), webAppRootEnv);

type AdditionalCspSources = NonNullable<
  NonNullable<WebAppConfig["csp"]>["additionalSources"]
>;

const appPromise = async () => {
  const packageJSONData = getPackageJson();

  const logger = createLogger();

  // const enableRedis = !!process.env["REDIS_DB_PASSWORD"];

  /**
   * WARNING: Do not change the default session timeout for production.
   * This setting is exposed to the client only for testing purposes.
   */
  const SESSSION_TIMEOUT = 15 * 60 * 1000; //15mins in milliseconds

  // Uncomment redis config/code after redis onboarding.
  // const redisConfig: RedisConfig = {
  //   host: process.env["REDIS_DB_HOST"] || "",
  //   port: parseInt(process.env["REDIS_DB_PORT"] || ""),
  //   secret: process.env["REDIS_DB_PASSWORD"] || "",
  //   authType: RedisAuthType.CERTIFICATE,
  //   enableTls: true,
  // };

  // Uncomment venafi config/code after venafi onboarding.
  // const enableVenafi =
  //   !!process.env["VENAFI_SERVICE_ACCOUNT_PASSWORD"] &&
  //   !!process.env["VENAFI_CERTIFICATE_PASSWORD"];

  const sessionConfig: OrchestraSessionConfigOptions = {
    secret: process.env["SESSION_SECRET"] || "default",
    resave: false,
    saveUninitialized: false,
    // store: enableRedis ? await getRedisStore(redisConfig) : undefined,
    // useRedisStore: true,
    cookie: {
      maxAge: SESSSION_TIMEOUT,
    },
  };

  // const apiXchangeClientId = process.env["API_XCHANGE_CLIENT_ID"];
  // const apiXchangeClientSecret = process.env["API_XCHANGE_CLIENT_SECRET"];
  // const apiXchangeConfig =
  //   apiXchangeClientId && apiXchangeClientSecret
  //     ? {
  //         clientId: apiXchangeClientId,
  //         clientSecret: apiXchangeClientSecret,
  //       }
  //     : undefined;

  const authConfig: WebAppAuthConfig = {
    oAuthUrl: process.env["AUTH_URL"] || undefined,
    redirectUrl: process.env["AUTH_REDIRECT_URL"]+(process.env["AUTH_REDIRECT_ROUTE"] || "/auth/redirect"),
    provider: "ping",
    clientId: process.env["AUTH_CLIENT_ID"],
    clientSecret: process.env["AUTH_CLIENT_SECRET"],
    // customAuthenticationScopes: ["EBSSH_ORCHESTRA"],
    serviceCallsConfig: {
      apixchange: {
        clientId: process.env["API_XCHANGE_CLIENT_ID"],
        clientSecret: process.env["API_XCHANGE_CLIENT_SECRET"],
      },
      sendAccessTokensToClient: true,
    }
  };

  const isAuthClientIsSetup = process.env["AUTH_CLIENT_ID"] && process.env["AUTH_CLIENT_SECRET"] ? true : false;

  const additionalCspSources: AdditionalCspSources = {
    // Add non-live-reload sources here as needed.
  };

  if (process.env["APP_ENV"] === "local") {
    additionalCspSources.script = [
      ...(additionalCspSources.script ?? []),
      "http://localhost:35729",
      "https://localhost:35729",
    ];
    additionalCspSources.connect = [
      ...(additionalCspSources.connect ?? []),
      "http://localhost:35729",
      "https://localhost:35729",
      "ws://localhost:35729",
      "wss://localhost:35729",
    ];
  }

  const config: WebAppConfig = {
    isWebApp: true,
    appId: '1ibms',
    acin: '1IBMS-A202SC',
    cin: 'A202SC',
    componentName: '1ibms-ui-react',
    appEnv: process.env["APP_ENV"] || "local",
    auth: isAuthClientIsSetup ? authConfig : undefined,
    artifactId: '1ibms-ui-react',
    packageJson: packageJSONData,
    sessionConfig: isAuthClientIsSetup ? sessionConfig : undefined,
    csp: {
      additionalSources: additionalCspSources,
    },
    // redisConfig,
    // venafiCertificateConfig: enableVenafi
    //   ? {
    //       enabled:
    //         !!process.env["VENAFI_SERVICE_ACCOUNT_PASSWORD"] &&
    //         !!process.env["VENAFI_CERTIFICATE_PASSWORD"],
    //       apiUrl: process.env["VENAFI_API_URL"] || "",
    //       serviceAccountUsername:
    //         process.env["VENAFI_SERVICE_ACCOUNT_USERNAME"] || "",
    //       serviceAccountPassword:
    //         process.env["VENAFI_SERVICE_ACCOUNT_PASSWORD"] || "",
    //       oAuthClientId: process.env["VENAFI_OAUTH_CLIENT_ID"] || "",
    //       pfxFileName: process.env["VENAFI_PFX_FILE_PATH"] || "",
    //       policyPath: process.env["VENAFI_POLICY_PATH"] || "",
    //       certificatePassword: process.env["VENAFI_CERTIFICATE_PASSWORD"] || "",
    //     }
    //   : undefined,
  };

  const app = await createApp(config);

  const ROOT_URL = process.env.ROOT_URL || "/";

  // api routes
  app.use(ROOT_URL, routes);

  // error handler
  app.use((err: any, req: Request, res: Response, next: NextFunction) => {
    logger.error(err.stack);
    apm.captureError(err);
    res.status(500).send("An error occurred. Please try again later.");
  });

  app.get("/{*any}", (req: Request, res: Response) => {
    res.sendFile(path.resolve(__dirname, process.env.WEB_APP_ROOT, "index.html"));
  });

  return app;
};

export default appPromise;

export function getPackageJson(): any {
  const buildModePath = path.join(__dirname, "./", "package.json");
  const devModePath = path.join(__dirname, "../", "package.json");

  return readPackageJson(buildModePath, devModePath);
}