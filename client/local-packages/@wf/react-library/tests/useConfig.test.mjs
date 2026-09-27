import assert from 'node:assert/strict';
import { after, afterEach, test } from 'node:test';
import { readFileSync } from 'node:fs';
import { JSDOM } from 'jsdom';
import React from 'react';
import { ConfigContextProvider, useConfig } from '../dist/hooks/useConfig.js';

const dom = new JSDOM('<!doctype html><html><body></body></html>', { url: 'http://localhost/' });
globalThis.window = dom.window;
globalThis.document = dom.window.document;
globalThis.HTMLElement = dom.window.HTMLElement;
globalThis.IS_REACT_ACT_ENVIRONMENT = true;
const { render, screen, cleanup, act } = await import('@testing-library/react');
const originalFetch = globalThis.fetch;
const env = JSON.parse(readFileSync(new URL('../../../../src/assets/json/env-properties.json', import.meta.url), 'utf8'));
const h = React.createElement;

function Consumer() {
    return h('output', null, JSON.stringify(useConfig().env));
}
function deferredRequest() {
    let resolve;
    const promise = new Promise(done => { resolve = done; });
    return { promise, resolve };
}
function response(body) {
    return { ok: true, json: async () => body };
}
afterEach(() => {
    cleanup();
    globalThis.fetch = originalFetch;
});
after(() => dom.window.close());

test('loads the existing environment JSON before rendering children', async () => {
    const request = deferredRequest();
    globalThis.fetch = (url, options) => {
        assert.equal(url, '/json/env-properties.json');
        assert.ok(options.signal instanceof AbortSignal);
        return request.promise;
    };
    render(h(ConfigContextProvider, { fallback: h('span', null, 'Loading settings') }, h(Consumer)));
    assert.ok(screen.getByText('Loading settings'));
    assert.equal(document.querySelector('output'), null);
    await act(async () => request.resolve(response(env)));
    assert.deepEqual(JSON.parse(document.querySelector('output').textContent), env);
});

test('async mode renders immediately and updates after configuration arrives', async () => {
    const request = deferredRequest();
    globalThis.fetch = () => request.promise;
    render(h(ConfigContextProvider, { async: true }, h(Consumer)));
    assert.equal(document.querySelector('output').textContent, '{}');
    await act(async () => request.resolve(response(env)));
    assert.deepEqual(JSON.parse(document.querySelector('output').textContent), env);
});

test('changing publicPath aborts the old request and ignores its late response', async () => {
    const calls = [];
    globalThis.fetch = (url, options) => {
        const request = deferredRequest();
        calls.push({ ...request, url, signal: options.signal });
        return request.promise;
    };
    const view = render(h(ConfigContextProvider, { publicPath: '/old/' }, h(Consumer)));
    view.rerender(h(ConfigContextProvider, { publicPath: '/new' }, h(Consumer)));
    assert.equal(calls[0].signal.aborted, true);
    assert.equal(calls[1].url, '/new/json/env-properties.json');
    await act(async () => calls[1].resolve(response({ source: 'new' })));
    await act(async () => calls[0].resolve(response({ source: 'old' })));
    assert.equal(document.querySelector('output').textContent, '{"source":"new"}');
    view.unmount();
    assert.equal(calls[1].signal.aborted, true);
});

test('Strict Mode cleanup does not prevent the live request from succeeding', async () => {
    const calls = [];
    globalThis.fetch = (url, options) => {
        const request = deferredRequest();
        calls.push({ ...request, signal: options.signal });
        return request.promise;
    };
    render(h(React.StrictMode, null, h(ConfigContextProvider, null, h(Consumer))));
    assert.equal(calls.length, 2);
    assert.equal(calls[0].signal.aborted, true);
    await act(async () => calls[1].resolve(response(env)));
    await act(async () => calls[0].resolve(response({ stale: true })));
    assert.deepEqual(JSON.parse(document.querySelector('output').textContent), env);
});

for (const [name, fetchResult] of [
    ['HTTP failure', async () => ({ ok: false, status: 404 })],
    ['network failure', async () => { throw new Error('Offline'); }],
    ['invalid JSON', async () => ({ ok: true, json: async () => { throw new SyntaxError('Invalid JSON'); } })],
    ['invalid configuration shape', async () => response([])],
]) {
    test(`shows an error and withholds children on ${name}`, async () => {
        globalThis.fetch = fetchResult;
        render(h(ConfigContextProvider, null, h(Consumer)));
        assert.match((await screen.findByRole('alert')).textContent, /Unable to load application settings/);
        assert.equal(document.querySelector('output'), null);
    });
}

test('a consumer outside the provider gets a clear error', () => {
    assert.throws(() => render(h(Consumer)), /useConfig must be used within ConfigContextProvider/);
});
