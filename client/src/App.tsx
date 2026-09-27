import type { FooterConfig, HeaderConfig, ServerConfig, WebAppConfig } from '@wf/react-library';
import { isNotEmpty, Template, useConfig } from '@wf/react-library';

import appConfig from './app/config/appConfiguration.json';
import { primaryNavigation, routes } from './app/routes';

function App(): React.ReactElement {
  const { env } = useConfig();

  const header: HeaderConfig = {
    appName: 'Orchestra React',
    navPrimary: primaryNavigation
  };

  const footer: FooterConfig = {
    version: isNotEmpty(appConfig.buildName)
      ? appConfig.buildName.replace('RELEASE :', '')
      : '1.0.0'
  };

  const server: ServerConfig = {
    serverUrl: typeof env.LOGGING_SERVER_URL === 'string' ? env.LOGGING_SERVER_URL : '',
    endPointIsOrchestraMicroService: true
  };

  const config: WebAppConfig = {
    app: {
      appId: '1ibms',
      appName: 'Orchestra React',
      componentName: '1ibms-ui-react',
      description: '',
      version: '0.0.1',
      acin: '1IBMS-A202SC',
      cin: 'A202SC'
    },
    theme: 'consumer',
    header,
    footer,
    routes,
    logger: {
      uiLogLevel: 4,
      uiLogToConsole: true,
      uiLogToServer: true,
      server
    },
    isWebApp: true
  };
  return <Template config={config} />;
}

export default App;
