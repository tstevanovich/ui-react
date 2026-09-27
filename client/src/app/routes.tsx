import type { NavItem, TemplateRoute } from '@wf/react-library';

import Home from '../home/Home';
import NotFound from './NotFound';

export const paths = { home: '/' } as const;

// Template already owns BrowserRouter. Do not add a second router in App.
export const routes: TemplateRoute[] = [
  { name: 'Home', path: paths.home, title: 'Home | Orchestra React', element: <Home /> },
  {
    name: 'Not found',
    path: '*',
    title: 'Page not found | Orchestra React',
    element: <NotFound />
  }
];

export const primaryNavigation: NavItem[] = [{ path: paths.home, label: 'Home' }];
