import type { FC, HTMLAttributes } from 'react';
import { sanitizeHtmlRich, sanitizeHtmlStrict } from '@/shared/security';

export interface ISafeHtmlProps extends HTMLAttributes<HTMLDivElement> {
    /**
     * HTML string to be sanitized and rendered.
     */
    html: string;
    /**
     * Sanitization variant to use.
     * - `strict`: Removes all HTML tags and attributes, leaving only plain text.
     * - `rich`: Allows safe HTML tags (p, b, strong, em, i, ul, ol, li, a, code, pre, blockquote, br, hr, span, img) and safe attributes.
     * @default 'strict'
     */
    variant?: 'rich' | 'strict';
}

/**
 * Component that safely renders HTML content by sanitizing it before rendering.
 * Uses DOMPurify to prevent XSS attacks by removing dangerous HTML tags and attributes.
 */
export const SafeHtml: FC<ISafeHtmlProps> = (props) => {
    const { html, variant = 'strict', ...rest } = props;
    const sanitized = variant === 'rich' ? sanitizeHtmlRich(html) : sanitizeHtmlStrict(html);

    // eslint-disable-next-line react/no-danger, no-restricted-syntax
    return <div {...rest} dangerouslySetInnerHTML={{ __html: sanitized }} />;
};
