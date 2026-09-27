import { createContext, createElement, Fragment, useContext, useEffect, useMemo, useState } from 'react';

const ConfigContext = createContext(undefined);

// Local implementation: publicPath is the base containing json/env-properties.json.
// By default children wait for settings; async=true renders with env={} while loading.
export function ConfigContextProvider({ children, publicPath = '/', async: renderWhileLoading = false, fallback = null }) {
    const url = `${publicPath.replace(/\/+$/, '')}/json/env-properties.json`;
    const [result, setResult] = useState(null);
    const current = result?.url === url ? result : null;
    const value = useMemo(() => ({ env: current?.env ?? {} }), [current]);

    useEffect(() => {
        const controller = new AbortController();

        async function loadConfig() {
            try {
                const response = await fetch(url, { signal: controller.signal });
                if (!response.ok) {
                    throw new Error(`Environment configuration request failed (${response.status}).`);
                }
                const env = await response.json();
                if (!env || typeof env !== 'object' || Array.isArray(env)) {
                    throw new Error('Environment configuration must be a JSON object.');
                }
                if (!controller.signal.aborted) {
                    setResult({ url, env, error: false });
                }
            } catch {
                if (!controller.signal.aborted) {
                    setResult({ url, error: true });
                }
            }
        }

        loadConfig();
        return () => controller.abort();
    }, [url]);

    if (current?.error) {
        return createElement('p', { role: 'alert' }, 'Unable to load application settings. Please reload the page.');
    }
    if (!current && !renderWhileLoading) {
        return createElement(Fragment, null, fallback);
    }
    return createElement(ConfigContext.Provider, { value }, children);
}

export function useConfig() {
    const context = useContext(ConfigContext);
    if (context === undefined) {
        throw new Error('useConfig must be used within ConfigContextProvider.');
    }
    return context;
}

export default useConfig;
