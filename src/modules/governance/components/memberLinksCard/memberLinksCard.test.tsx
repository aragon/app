import {
    buildGithubUrl,
    buildTwitterUrl,
    sanitizeUrl,
} from './memberLinksCard';

describe('buildTwitterUrl', () => {
    it('builds a valid X profile URL from a plain handle', () => {
        expect(buildTwitterUrl('vitalik')).toBe('https://x.com/vitalik');
    });

    it('strips leading @ from handle', () => {
        expect(buildTwitterUrl('@vitalik')).toBe('https://x.com/vitalik');
    });

    it('allows underscores in handles', () => {
        expect(buildTwitterUrl('vitalik_eth')).toBe(
            'https://x.com/vitalik_eth',
        );
    });

    it('rejects handles with path traversal characters', () => {
        expect(buildTwitterUrl('../malicious')).toBeNull();
    });

    it('rejects handles with spaces', () => {
        expect(buildTwitterUrl('foo bar')).toBeNull();
    });

    it('rejects empty handle after stripping @', () => {
        expect(buildTwitterUrl('@')).toBeNull();
    });
});

describe('buildGithubUrl', () => {
    it('builds a valid GitHub profile URL', () => {
        expect(buildGithubUrl('octocat')).toBe('https://github.com/octocat');
    });

    it('allows hyphens and dots in handles', () => {
        expect(buildGithubUrl('my-user.name')).toBe(
            'https://github.com/my-user.name',
        );
    });

    it('rejects handles with slashes', () => {
        expect(buildGithubUrl('user/repo')).toBeNull();
    });

    it('rejects handles with special characters', () => {
        expect(buildGithubUrl('user<script>')).toBeNull();
    });
});

describe('sanitizeUrl', () => {
    it('accepts bare domains by normalizing them to https', () => {
        expect(sanitizeUrl('example.com')).toBe('https://example.com/');
    });

    it('accepts https URLs', () => {
        expect(sanitizeUrl('https://example.com')).toBe('https://example.com/');
    });

    it('accepts http URLs', () => {
        expect(sanitizeUrl('http://example.com')).toBe('http://example.com/');
    });

    it('preserves path and query string', () => {
        expect(sanitizeUrl('https://example.com/page?q=1')).toBe(
            'https://example.com/page?q=1',
        );
    });

    it('rejects javascript: protocol', () => {
        expect(sanitizeUrl('javascript:alert(1)')).toBeNull();
    });

    it('rejects data: protocol', () => {
        expect(sanitizeUrl('data:text/html,<h1>XSS</h1>')).toBeNull();
    });

    it('rejects protocol-relative javascript payloads after normalization', () => {
        expect(sanitizeUrl('//javascript:alert(1)')).toBeNull();
    });

    it('rejects malformed URLs', () => {
        expect(sanitizeUrl('not-a-url')).toBeNull();
    });

    it('rejects empty string', () => {
        expect(sanitizeUrl('')).toBeNull();
    });
});
