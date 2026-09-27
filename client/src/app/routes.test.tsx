import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, useRoutes } from 'react-router-dom';

import { routes } from './routes';

function TestRoutes() {
  return useRoutes(routes);
}

it('lets a visitor recover from an unknown route without leaving the app', async () => {
  const user = userEvent.setup();
  render(
    <MemoryRouter initialEntries={['/missing']}>
      <TestRoutes />
    </MemoryRouter>
  );
  expect(screen.getByRole('heading', { name: 'Page not found' })).toBeInTheDocument();
  await user.click(screen.getByRole('link', { name: 'Return to Home' }));
  expect(screen.getByRole('heading', { name: 'Welcome' })).toBeInTheDocument();
});
