import type { ReactNode } from 'react';
import type { TemplateConfig } from '../../interfaces';

export interface TemplateProps {
    config: TemplateConfig;
    children?: ReactNode;
}

export declare const Template: (
    props: TemplateProps
) => import('react/jsx-runtime').JSX.Element;

export default Template;