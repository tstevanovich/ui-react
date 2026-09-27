import { render, screen, within } from '@testing-library/react';
import { ConfigContextProvider } from '@wf/react-library';

import App from './App';
import appConfig from './app/config/appConfiguration.json';
import env from './assets/json/env-properties.json';

it('renders the application using the installed local WF package and environment settings', async () => {
  const previousFetch = globalThis.fetch;
  const fetchMock = jest.fn().mockResolvedValue({ ok: true, json: async () => env });
  globalThis.fetch = fetchMock as typeof fetch;
  try {
    render(
      <ConfigContextProvider>
        <App />
      </ConfigContextProvider>
    );
    expect(await screen.findByRole('heading', { name: 'Welcome' })).toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledWith(
      '/json/env-properties.json',
      expect.objectContaining({ signal: expect.any(AbortSignal) })
    );
    expect(screen.getByTestId('app-name')).toHaveTextContent('Orchestra React');
    const footer = within(screen.getByRole('contentinfo'));
    expect(footer.getByTestId('version-number')).toHaveTextContent(
      appConfig.buildName.replace('RELEASE :', '') || '1.0.0'
    );
    expect(
      footer.getByRole('link', { name: 'Privacy, Security & Legal (opens a new tab)' })
    ).toHaveAttribute('href', 'https://www.wellsfargo.com/privacy-security/');
  } finally {
    globalThis.fetch = previousFetch;
  }
});
