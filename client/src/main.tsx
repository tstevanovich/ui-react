import { ConfigContextProvider } from '@wf/react-library';
import React from 'react';
import ReactDOM from 'react-dom/client';

import App from './App';
import { injectLiveReloadScript } from './liveReload';

injectLiveReloadScript();

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <ConfigContextProvider>
      <App />
    </ConfigContextProvider>
  </React.StrictMode>
);
