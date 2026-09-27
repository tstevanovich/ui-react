import type { ReactNode } from 'react';
export type ConfigContextType = {
    env: Record<string, unknown>;
};
interface Props {
    children: ReactNode;
    /** Base path containing json/env-properties.json. Defaults to '/'. */
    publicPath?: string;
    /** Render children with an empty env while loading. Defaults to false. */
    async?: boolean;
    /** Content shown while loading when async is false. */
    fallback?: ReactNode;
}
export declare function ConfigContextProvider({ children, publicPath, async, fallback, }: Props): import("react/jsx-runtime").JSX.Element;
export declare const useConfig: () => ConfigContextType;
export default useConfig;
