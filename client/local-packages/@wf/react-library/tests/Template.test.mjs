import assert from 'node:assert/strict';
import { after, afterEach, test } from 'node:test';
import { JSDOM } from 'jsdom';
import React from 'react';

const dom = new JSDOM('<!doctype html><html><body></body></html>', { url: 'http://localhost/' });
globalThis.window = dom.window;
globalThis.document = dom.window.document;
globalThis.HTMLElement = dom.window.HTMLElement;
globalThis.IS_REACT_ACT_ENVIRONMENT = true;
const { render, screen, cleanup, fireEvent, within } = await import('@testing-library/react');
const { Template } = await import('../dist/components/template/Template.component.js');
const h = React.createElement;

function config() {
    return {
        app: { appId: 'test', appName: 'Orchestra React', componentName: 'test', description: '', version: '1.0.0' },
        theme: 'consumer', isWebApp: true,
        header: { appName: 'Orchestra React', navPrimary: [{ path: '/', label: 'Home' }, { path: '/details', label: 'Details' }] },
        footer: { version: '2.3.4' },
        routes: [
            { name: 'Home', path: '/', element: h('h1', null, 'Welcome') },
            { name: 'Details', path: '/details', title: 'Details page', element: h('h1', null, 'Details content') },
        ],
    };
}
afterEach(() => {
    cleanup();
    window.history.replaceState({}, '', '/');
});
after(() => dom.window.close());

test('renders the configured page and the supplied default footer text and URLs', () => {
    render(h(Template, { config: config() }));
    assert.ok(screen.getByRole('heading', { name: 'Welcome' }));
    assert.equal(document.title, 'Orchestra React');
    const footer = within(screen.getByRole('contentinfo'));
    assert.ok(footer.getByText(`Copyright \u00a9 1999-${new Date().getFullYear()}`));
    assert.ok(footer.getByText('Wells Fargo Bank, N.A. All Rights Reserved'));
    assert.equal(footer.getByTestId('version-number').textContent, '2.3.4');
    const privacy = footer.getByRole('link', { name: 'Privacy, Security & Legal (opens a new tab)' });
    assert.equal(privacy.getAttribute('href'), 'https://www.wellsfargo.com/privacy-security/');
    assert.equal(privacy.getAttribute('target'), '_blank');
    assert.equal(privacy.getAttribute('rel'), 'noopener noreferrer');
    const orchestra = footer.getByRole('link', { name: 'Orchestra (opens a new tab)' });
    assert.equal(orchestra.getAttribute('href'), 'http://hop.hosting.wellsfargo.com/orchestra/');
});

test('navigation changes the page, active link, and document title', async () => {
    render(h(Template, { config: config() }));
    const navigation = within(screen.getByRole('navigation', { name: 'Navigation Menu' }));
    assert.equal(navigation.getByRole('link', { name: 'Home' }).getAttribute('aria-current'), 'page');
    fireEvent.click(navigation.getByRole('link', { name: 'Details' }));
    await screen.findByRole('heading', { name: 'Details content' });
    assert.equal(window.location.pathname, '/details');
    assert.equal(document.title, 'Details page');
    assert.equal(navigation.getByRole('link', { name: 'Details' }).getAttribute('aria-current'), 'page');
    assert.equal(navigation.getByRole('link', { name: 'Home' }).getAttribute('aria-current'), null);
});

test('mobile navigation opens, routes, and closes on selection', async () => {
    render(h(Template, { config: config() }));
    // jsdom does not evaluate viewport media queries; check menu interaction here.
    const menu = screen.getByRole('button', { name: 'Open Menu Navigation' });
    assert.equal(menu.getAttribute('aria-expanded'), 'false');
    fireEvent.click(menu);
    assert.equal(menu.getAttribute('aria-expanded'), 'true');
    const mobile = within(screen.getByRole('navigation', { name: 'Mobile Navigation' }));
    fireEvent.click(mobile.getByRole('link', { name: 'Details' }));
    await screen.findByRole('heading', { name: 'Details content' });
    assert.equal(menu.getAttribute('aria-expanded'), 'false');
    assert.equal(screen.queryByRole('navigation', { name: 'Mobile Navigation' }), null);
});

test('skip link moves focus to the content target', () => {
    render(h(Template, { config: config() }));
    fireEvent.click(screen.getByRole('link', { name: 'Skip to main content' }));
    assert.equal(document.activeElement, screen.getByTestId('skipTarget'));
});

test('supports hidden header and footer', () => {
    const settings = config();
    settings.header.mode = 'hidden';
    settings.footer.mode = 'hidden';
    render(h(Template, { config: settings }));
    assert.equal(screen.queryByRole('banner'), null);
    assert.equal(screen.queryByRole('contentinfo'), null);
    assert.ok(screen.getByRole('heading', { name: 'Welcome' }));
});

test('renders supplied children and footer overrides', () => {
    const settings = config();
    settings.footer.allRightsReserved = 'Custom footer text';
    settings.footer.linksPrimary = [{ path: '/help', label: 'Help' }];
    render(h(Template, { config: settings }, h('p', null, 'Additional content')));
    assert.ok(screen.getByText('Additional content'));
    assert.ok(screen.getByText('Custom footer text'));
    assert.equal(within(screen.getByRole('contentinfo')).getByRole('link', { name: 'Help' }).getAttribute('href'), '/help');
});

test('an unknown path shows a not-found page inside the shared layout', () => {
    window.history.replaceState({}, '', '/missing');
    render(h(Template, { config: config() }));
    assert.ok(screen.getByRole('heading', { name: 'Page not found' }));
    assert.ok(screen.getByRole('banner'));
    assert.ok(screen.getByRole('contentinfo'));
});
