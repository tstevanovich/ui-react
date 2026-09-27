import type { Express, json } from 'express';
import type { SessionOptions } from 'express-session';
import type { Logger } from 'winston';

/** Local declarations for the subset consumed by this project, not upstream types. */
export interface OrchestraSessionConfigOptions extends SessionOptions {
  useRedisStore?: boolean;
}

/** Accepted by the application's configuration builder; rejected by this local runtime. */
export interface WebAppAuthConfig {
  oAuthUrl?: string;
  redirectUrl?: string;
  provider?: string;
  clientId?: string;
  clientSecret?: string;
  serviceCallsConfig?: {
    apixchange?: { clientId?: string; clientSecret?: string };
    sendAccessTokensToClient?: boolean;
  };
}

export interface WebAppConfig {
  isWebApp: true;
  appId: string;
  cin?: string;
  acin?: string;
  componentName?: string;
  artifactId?: string;
  appEnv?: string;
  packageJson?: Record<string, unknown>;
  jsonParserOptions?: Parameters<typeof json>[0];
  auth?: WebAppAuthConfig;
  sessionConfig?: OrchestraSessionConfigOptions;
  csp?: {
    additionalSources?: Partial<Record<
      'ALL' | 'script' | 'style' | 'img' | 'connect' | 'font' | 'frame' | 'formAction',
      string[]
    >>;
  };
}

export declare function createApp(config: WebAppConfig): Promise<Express>;
export declare function createLogger(): Logger;
export declare function readPackageJson(buildModePath: string, devModePath: string): Record<string, unknown>;
