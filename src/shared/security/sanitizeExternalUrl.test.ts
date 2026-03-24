import { sanitizeExternalHttpUrl } from './sanitizeExternalUrl';

describe('sanitizeExternalHttpUrl', () => {
    it('accepts bare domains by normalizing them to https', () => {
        expect(sanitizeExternalHttpUrl('example.com')).toBe(
            'https://example.com/',
        );
    });

    it('accepts https URLs', () => {
        expect(sanitizeExternalHttpUrl('https://example.com')).toBe(
            'https://example.com/',
        );
    });

    it('accepts http URLs', () => {
        expect(sanitizeExternalHttpUrl('http://example.com')).toBe(
            'http://example.com/',
        );
    });

    it('preserves path and query string', () => {
        expect(sanitizeExternalHttpUrl('https://example.com/page?q=1')).toBe(
            'https://example.com/page?q=1',
        );
    });

    it('accepts URLs with query string without protocol', () => {
        expect(sanitizeExternalHttpUrl('example.com/page?q=1')).toBe(
            'https://example.com/page?q=1',
        );
    });

    it('rejects javascript: protocol', () => {
        expect(sanitizeExternalHttpUrl('javascript:alert(1)')).toBeNull();
    });

    it('rejects data: protocol', () => {
        expect(
            sanitizeExternalHttpUrl('data:text/html,<h1>XSS</h1>'),
        ).toBeNull();
    });

    it('rejects protocol-relative javascript payloads after normalization', () => {
        expect(sanitizeExternalHttpUrl('//javascript:alert(1)')).toBeNull();
    });

    it('rejects malformed URLs', () => {
        expect(sanitizeExternalHttpUrl('not-a-url')).toBeNull();
    });

    it('rejects empty string', () => {
        expect(sanitizeExternalHttpUrl('')).toBeNull();
    });
});
