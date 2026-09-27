import { injectLiveReloadScript } from './liveReload';

describe('injectLiveReloadScript', () => {
  beforeEach(() => {
    document.head.innerHTML = '';
  });

  it('injects the live reload script on localhost', () => {
    injectLiveReloadScript('localhost');

    const script = document.querySelector<HTMLScriptElement>('script[data-live-reload="true"]');

    expect(script).not.toBeNull();
    expect(script?.src).toContain('http://localhost:35729/livereload.js?snipver=1');
    expect(script?.async).toBe(true);
  });

  it('does not inject the script for non-localhost hostnames', () => {
    injectLiveReloadScript('example.com');

    expect(document.querySelector('script[data-live-reload="true"]')).toBeNull();
  });

  it('does not inject duplicate live reload scripts', () => {
    injectLiveReloadScript('localhost');
    injectLiveReloadScript('localhost');

    const scripts = document.querySelectorAll('script[data-live-reload="true"]');
    expect(scripts).toHaveLength(1);
  });
});
