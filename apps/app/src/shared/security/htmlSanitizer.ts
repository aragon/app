import DOMPurify from 'isomorphic-dompurify';

/**
 * Remove ASCII control characters from a string.
 * - By default removes codes 0–31 and 127.
 * - When allowMultiline=true, preserves Tab (9), LF (10) and CR (13).
 */
const stripControlChars = (value: string, allowMultiline: boolean): string => {
    let result = '';
    for (let i = 0; i < value.length; i++) {
        const code = value.charCodeAt(i);
        const isAllowedWhitespace =
            allowMultiline && (code === 9 || code === 10 || code === 13);
        const isControl = (code < 32 && !isAllowedWhitespace) || code === 127;
        if (!isControl) {
            result += value[i];
        }
    }
    return result;
};

/**
 * Sanitize single-line plain text: strips control chars and trims.
 */
export const sanitizePlainText = (value: string): string => {
    // Remove HTML tags while keeping inner text, replace with space to prevent word concatenation
    const noTags = value.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ');
    return stripControlChars(noTags, false).trim();
};

/**
 * Sanitize multi-line plain text: normalizes CRLF to LF, preserves newlines and tabs,
 * strips other control chars, then trims leading/trailing whitespace.
 */
export const sanitizePlainTextMultiline = (value: string): string => {
    const normalized = value.replace(/\r\n?/g, '\n');
    // Replace HTML tags with space, collapse multiple spaces but preserve newlines and tabs
    const noTags = normalized.replace(/<[^>]*>/g, ' ').replace(/ +/g, ' ');
    return stripControlChars(noTags, true).trim();
};

// Basic URL safety check: allow only http(s) and relative URLs
export const isSafeUrl = (href: string): boolean => /^(https?:|\/)/i.test(href);

// Configure a hook once to harden anchors
// - drop unsafe href schemes
// - enforce rel for external targets
// This applies for all sanitizations below
interface AnchorNode {
    tagName?: string;
    getAttribute(name: string): string | null;
    setAttribute(name: string, value: string): void;
    removeAttribute(name: string): void;
}

const isAnchorNode = (node: unknown): node is AnchorNode =>
    typeof node === 'object' &&
    node !== null &&
    'tagName' in node &&
    'getAttribute' in node &&
    'setAttribute' in node &&
    'removeAttribute' in node;

try {
    // Hook is a no-op on servers without DOM-like nodes, but isomorphic-dompurify provides compatible shims
    DOMPurify.addHook('afterSanitizeAttributes', (node: unknown) => {
        if (!isAnchorNode(node)) {
            return;
        }
        const tag = node.tagName?.toLowerCase();

        // Harden anchor tags
        if (tag === 'a') {
            const href = node.getAttribute('href') ?? '';
            if (!isSafeUrl(href)) {
                node.removeAttribute('href');
            }
            if (node.getAttribute('target') === '_blank') {
                const existingRel = node.getAttribute('rel') ?? '';
                const rel = new Set<string>([
                    ...existingRel.split(/\s+/).filter(Boolean),
                    'noopener',
                    'noreferrer',
                ]);
                node.setAttribute('rel', Array.from(rel).join(' '));
            }
        }

        // Harden img tags - only allow safe src URLs
        if (tag === 'img') {
            const src = node.getAttribute('src') ?? '';
            if (src && !isSafeUrl(src) && !src.startsWith('data:image/')) {
                node.removeAttribute('src');
            }
        }
    });
} catch {
    // ignore hook errors in non-DOM environments
}

const RICH_ALLOWED_TAGS = [
    'p',
    'b',
    'strong',
    'em',
    'i',
    'ul',
    'ol',
    'li',
    'a',
    'code',
    'pre',
    'blockquote',
    'br',
    'hr',
    'span',
];

const RICH_ALLOWED_ATTR = [
    'href',
    'rel',
    'class',
    'title',
    'target',
    'src',
    'alt',
];

export const sanitizeHtmlStrict = (html: string): string =>
    DOMPurify.sanitize(html, { ALLOWED_TAGS: [], ALLOWED_ATTR: [] });

export const sanitizeHtmlRich = (html: string): string =>
    DOMPurify.sanitize(html, {
        ALLOWED_TAGS: RICH_ALLOWED_TAGS,
        ALLOWED_ATTR: RICH_ALLOWED_ATTR,
        ALLOW_DATA_ATTR: false,
        FORBID_TAGS: ['style', 'script'],
        FORBID_ATTR: ['style', 'on*'],
        ADD_ATTR: ['target'],
    });
