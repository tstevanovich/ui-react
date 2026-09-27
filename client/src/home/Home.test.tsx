import { render, screen } from '@testing-library/react';

import Home from './Home';

describe('Home', () => {
  test('renders heading', () => {
    render(<Home />);
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Welcome');
  });
});
