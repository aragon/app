import { sanitizeHtmlRich, sanitizeHtmlStrict } from '@/shared/security/htmlSanitizer';
import type React from 'react';

export interface ISafeHtmlProps extends React.HTMLAttributes<HTMLDivElement> {
    html: string;
    variant?: 'rich' | 'strict';
}

export const SafeHtml: React.FC<ISafeHtmlProps> = (props) => {
    const { html, variant = 'strict', ...rest } = props;
    const sanitized = variant === 'rich' ? sanitizeHtmlRich(html) : sanitizeHtmlStrict(html);

    // eslint-disable-next-line react/no-danger
    return <div {...rest} dangerouslySetInnerHTML={{ __html: sanitized }} />;
};
