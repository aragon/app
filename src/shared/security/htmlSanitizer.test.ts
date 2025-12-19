import {
    isSafeUrl,
    sanitizeHtmlRich,
    sanitizeHtmlStrict,
    sanitizePlainText,
    sanitizePlainTextMultiline,
} from './htmlSanitizer';

describe('htmlSanitizer', () => {
    test('sanitizeHtmlStrict strips all tags and scripts', () => {
        const input =
            '<img src=x onerror=alert(1)><script>alert(1)</script><p>text</p>';
        const out = sanitizeHtmlStrict(input);
        expect(out).toContain('text');
        expect(out).not.toContain('<img');
        expect(out).not.toContain('<script');
        expect(out).not.toContain('<p>');
    });

    test('sanitizeHtmlRich keeps allowed tags and drops dangerous attributes', () => {
        const input =
            '<p>hello <strong>world</strong><img src="https://example.com/img.jpg" onerror=alert(1)></p>';
        const out = sanitizeHtmlRich(input);
        expect(out).toContain('<p>');
        expect(out).toContain('<strong>world</strong>');
        expect(out).not.toContain('onerror');
        expect(out).not.toContain('<img');
    });

    test('sanitizeHtmlRich removes script tags', () => {
        const input =
            '<p>text</p><script>alert(1)</script><img src="https://example.com/img.jpg">';
        const out = sanitizeHtmlRich(input);
        expect(out).toContain('<p>text</p>');
        expect(out).not.toContain('<script');
        expect(out).not.toContain('alert(1)');
    });

    test('sanitizeHtmlRich neutralizes unsafe anchor href and sets rel on target', () => {
        const bad = '<a href="javascript:alert(1)">x</a>';
        const outBad = sanitizeHtmlRich(bad);
        expect(outBad).not.toMatch(/href\s*=\s*"javascript:/i);

        const good = '<a href="https://example.com" target="_blank">link</a>';
        const outGood = sanitizeHtmlRich(good);
        expect(outGood).toContain('href="https://example.com"');
        // rel should include both tokens if target is _blank
        expect(outGood).toMatch(/rel="[^"]*(noopener)[^"]*"/);
        expect(outGood).toMatch(/rel="[^"]*(noreferrer)[^"]*"/);
    });

    test('sanitizePlainText removes control chars and trims', () => {
        const input = '\u0000 text \u0008 ';
        const out = sanitizePlainText(input);
        expect(out).toBe('text');
    });

    test('sanitizePlainTextMultiline preserves newlines/tabs and normalizes CRLF', () => {
        const input = ' line1\r\n\tline2\n\u0000line3 ';
        const out = sanitizePlainTextMultiline(input);
        expect(out).toBe('line1\n\tline2\nline3');
    });

    test('isSafeUrl allows http(s) and relative only', () => {
        expect(isSafeUrl('https://a.com')).toBe(true);
        expect(isSafeUrl('/path')).toBe(true);
        expect(isSafeUrl('mailto:x@y')).toBe(false);
        expect(isSafeUrl('javascript:alert(1)')).toBe(false);
    });
});
