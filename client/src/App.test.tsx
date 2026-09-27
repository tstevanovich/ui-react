import { render, screen } from '@testing-library/react';
import type { TemplateProps } from '@wf/react-library';
import { isNotEmpty } from '@wf/react-library';

import App from './App';

jest.mock('@wf/react-library', () => ({
  isNotEmpty: jest.fn(),
  Template: ({ config }: TemplateProps) => <div data-testid="template">{config.app.appId}</div>,
  useConfig: jest.fn().mockReturnValue({
    env: {
      LOGGING_SERVER_URL: 'http://localhost:8080'
    }
  })
}));

describe('App', () => {
  it('renders the Template component with correct props when buildName available', () => {
    (isNotEmpty as jest.Mock).mockReturnValue(true);
    render(<App />);
    expect(screen.getByTestId('template').textContent).toBe('1ibms');
  });
  it('renders the Template component with correct props when buildName not available', () => {
    (isNotEmpty as jest.Mock).mockReturnValue(false);
    render(<App />);
    expect(screen.getByTestId('template').textContent).toBe('1ibms');
  });
});
