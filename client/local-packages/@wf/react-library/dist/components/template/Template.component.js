import { createElement as h, Fragment, Suspense, useEffect, useState } from 'react';
import {
    AppBar, Box, CircularProgress, CssBaseline, IconButton, Link, Stack,
    ThemeProvider, Toolbar, Typography, createTheme, responsiveFontSizes,
} from '@mui/material';
import { BrowserRouter, NavLink, matchRoutes, useLocation, useRoutes } from 'react-router-dom';

// Local consumer-theme approximation. The original theme and header SVG were
// not available; the existing app icon stands in for that SVG.
const theme = responsiveFontSizes(createTheme({
    palette: {
        primary: { main: '#d71e28' },
        secondary: { main: '#ffcd41' },
        text: { primary: '#3b3331' },
        background: { default: '#fff', paper: '#fff' },
    },
    typography: { fontFamily: 'Arial, Helvetica, sans-serif' },
}));

function NavigationItems({ items = [], closeMenu }) {
    return items.map((item) => {
        const external = item.external || item.newTab;
        const common = {
            key: item.key || item.path || item.label,
            onClick: closeMenu,
            sx: {
                color: 'text.primary', textDecoration: 'none', fontSize: 15,
                display: 'inline-flex', alignItems: 'center', minHeight: 40,
                borderBottom: '3px solid transparent', px: 1,
                '&.active': { borderBottomColor: 'primary.main', fontWeight: 700 },
                '&:hover': { textDecoration: 'underline' },
            },
        };
        if (!item.path) {
            return h(Link, {
                ...common, component: 'button', type: 'button',
                onClick: () => { item.onClick?.(); closeMenu?.(); },
            }, item.label);
        }
        return h(Link, external ? {
            ...common, href: item.path, target: item.newTab ? '_blank' : undefined,
            rel: item.newTab ? 'noopener noreferrer' : undefined,
        } : {
            ...common, component: NavLink, to: item.path, end: item.path === '/',
        }, item.label);
    });
}

function Header({ config }) {
    const [open, setOpen] = useState(config.navOpen ?? false);
    if (config.mode === 'hidden') return null;
    const hasNavigation = !!(config.navPrimary?.length || config.navSecondary?.length);
    const logo = h(Box, {
        component: 'img', src: '/favicons/apple-touch-icon_120x120.png',
        alt: 'Wells Fargo', sx: { display: 'block', width: 40, height: 40 },
    });
    const logoContent = config.hideLogo ? null : config.logoLink
        ? h(Link, { href: config.logoLink, 'aria-label': 'Wells Fargo home' }, logo)
        : logo;

    return h(Fragment, null,
        h(AppBar, {
            position: 'static', component: 'header', role: 'banner',
            sx: { borderBottom: '4px solid', borderColor: 'secondary.main', boxShadow: 'none' },
        }, h(Toolbar, { disableGutters: true, sx: { px: '17px' } },
            hasNavigation && h(IconButton, {
                color: 'inherit', edge: 'start',
                'aria-label': 'Open Menu Navigation', 'aria-expanded': open,
                'aria-controls': 'template-mobile-navigation', onClick: () => setOpen(value => !value),
                sx: { display: { xs: 'inline-flex', md: 'none' } },
            }, h('span', { 'aria-hidden': true }, '\u2630')),
            h(Stack, {
                direction: 'row', spacing: 4, alignItems: 'center',
                sx: { display: { xs: 'none', md: 'flex' }, flexGrow: 1 },
            }, logoContent, config.appName && h(Typography, {
                component: 'div', 'data-testid': 'app-name',
                sx: {
                    fontSize: 24, fontWeight: 500, lineHeight: '24px',
                    borderLeft: config.hideLogo ? undefined : '1px solid',
                    borderColor: 'secondary.main', pl: config.hideLogo ? 0 : 4,
                },
            }, config.appName)),
            h(Box, {
                sx: { display: { xs: 'flex', md: 'none' }, justifyContent: 'center', flexGrow: 1 },
            }, logoContent),
        )),
        hasNavigation && h(Box, {
            component: 'nav', 'aria-label': 'Navigation Menu', className: 'l1-menu',
            sx: {
                display: { xs: 'none', md: 'flex' }, height: 40, px: '17px',
                justifyContent: 'space-between', backgroundColor: '#fff',
            },
        },
            h(Stack, { direction: 'row', spacing: 4, 'aria-label': 'Primary Navigation' },
                h(NavigationItems, { items: config.navPrimary })),
            h(Stack, { direction: 'row', spacing: 4, 'aria-label': 'Secondary Navigation' },
                h(NavigationItems, { items: config.navSecondary })),
        ),
        hasNavigation && open && h(Stack, {
            component: 'nav', id: 'template-mobile-navigation', 'aria-label': 'Mobile Navigation',
            sx: { display: { xs: 'flex', md: 'none' }, px: '17px', backgroundColor: '#fff' },
        }, h(NavigationItems, {
            items: [...(config.navPrimary || []), ...(config.navSecondary || [])],
            closeMenu: () => setOpen(false),
        })),
    );
}

function Footer({ config }) {
    if (!config || config.mode === 'hidden') return null;
    return h(Box, {
        component: 'footer', role: 'contentinfo',
        sx: {
            position: config.sticky ? 'sticky' : 'static', bottom: config.sticky ? 0 : undefined,
            borderTop: '1px solid #d8d8d8', backgroundColor: '#f4f0ed', color: 'text.primary',
            p: { xs: '24px', sm: '33px 32px 32px' },
        },
    },
        h(Stack, { sx: { alignItems: { xs: 'center', sm: 'flex-start' } } },
            h(Stack, {
                sx: {
                    flexDirection: { xs: 'column', sm: 'row' }, flexWrap: 'wrap', alignItems: 'center',
                    fontSize: 13, lineHeight: '16px', columnGap: 2, rowGap: 2,
                },
            },
                [...(config.linksPrimary || []), ...(config.linksSecondary || [])].map((item) =>
                    h(Link, { key: item.key || item.path || item.label, href: item.path, color: 'inherit' }, item.label)),
                h(Stack, { id: 'security-link', direction: 'row', alignItems: 'center' },
                    h('span', { 'aria-hidden': true, style: { marginRight: 4, fontSize: 16 } }, '\uD83D\uDD12'),
                    h(Link, {
                        href: 'https://www.wellsfargo.com/privacy-security/', target: '_blank',
                        rel: 'noopener noreferrer', color: 'inherit',
                        'aria-label': 'Privacy, Security & Legal (opens a new tab)',
                    }, 'Privacy, Security & Legal'),
                ),
            ),
            h(Box, {
                component: 'hr', sx: { display: { xs: 'block', sm: 'none' }, width: '100%', mt: 2, mb: 0 },
            }),
            h(Stack, {
                id: 'copyright-version-wrapper', direction: { xs: 'column-reverse', md: 'row' },
                sx: { mt: 3, flexWrap: 'wrap', fontSize: 13, lineHeight: '16px' },
            },
                h(Stack, {
                    id: 'copyright-wrapper', direction: { xs: 'column', sm: 'row' },
                    sx: { gap: { xs: 0, sm: 1 }, alignItems: { xs: 'center', sm: 'flex-start' }, pr: { xs: 0, sm: 4 } },
                },
                    h('div', { id: 'copyright-container' }, `Copyright \u00a9 1999-${new Date().getFullYear()}`),
                    h('div', { id: 'all-rights-reserved-container' }, config.allRightsReserved || 'Wells Fargo Bank, N.A. All Rights Reserved'),
                ),
                h(Stack, {
                    id: 'version-wrapper', direction: 'row', spacing: 2,
                    sx: { display: { xs: 'none', sm: 'flex' }, pb: { xs: 2, md: 0 } },
                },
                    h('div', { 'data-testid': 'version-number-container' }, 'Version: ',
                        h('span', { 'data-testid': 'version-number' }, config.version)),
                    h('div', { 'data-testid': 'powered-by-container' }, 'Powered By ', h(Link, {
                        href: 'http://hop.hosting.wellsfargo.com/orchestra/', target: '_blank',
                        rel: 'noopener noreferrer', color: 'inherit', 'aria-label': 'Orchestra (opens a new tab)',
                    }, 'Orchestra')),
                ),
            ),
        ),
    );
}

function Layout({ config, children }) {
    const location = useLocation();
    const page = useRoutes([
        ...(config.routes || []).map(route => ({ path: route.path, element: route.element })),
        { path: '*', element: h(Typography, { component: 'h1', variant: 'h4', sx: { p: 3 } }, 'Page not found') },
    ]);
    const matches = matchRoutes(config.routes || [], location);
    const title = matches?.at(-1)?.route.title || config.app.appName;
    useEffect(() => { document.title = title; }, [title]);
    const stickyHeader = config.header.sticky !== false;

    return h(Box, {
        className: 'app-wrapper',
        sx: { height: '100vh', display: 'flex', flexDirection: 'column', overflow: stickyHeader ? 'hidden' : 'auto' },
    },
        h(Box, {
            component: 'a', href: '#skip', id: 'skip-to-main-content', 'data-testid': 'skip-anchor',
            onClick: (event) => {
                event.preventDefault();
                const target = document.getElementById('skip');
                target?.focus();
                target?.scrollIntoView?.({ behavior: 'smooth' });
            },
            sx: {
                position: 'absolute', top: -40, left: 0, zIndex: 100000, p: '6px',
                backgroundColor: '#f0f0f0', color: '#3b3331', '&:focus': { top: 2 },
            },
        }, 'Skip to main content'),
        h(Box, { className: 'header-wrapper', sx: { flexShrink: 0 } }, h(Header, { config: config.header })),
        h(Box, {
            component: 'main', className: 'main-content-wrapper',
            sx: { display: 'flex', flexDirection: 'column', flexGrow: 1, minHeight: stickyHeader ? 0 : 'auto', overflow: stickyHeader ? 'auto' : 'visible' },
        },
            h('div', { id: 'skip', tabIndex: -1, 'data-testid': 'skipTarget' }),
            h(Box, { component: 'section', className: 'content-wrapper', sx: { flexGrow: 1 } },
                h(Suspense, { fallback: h(CircularProgress, { 'aria-label': 'Loading page' }) }, children, page)),
            h(Footer, { config: config.footer }),
        ),
    );
}

// Supports the current app's consumer theme, flat navigation, and default footer.
// Authentication, session handling, other themes, route loaders/actions, and logging
// are intentionally not implemented by this local UI substitute.
export function Template({ config, children }) {
    return h(ThemeProvider, { theme },
        h(CssBaseline),
        h(BrowserRouter, null, h(Layout, { config }, children)),
    );
}

export default Template;
