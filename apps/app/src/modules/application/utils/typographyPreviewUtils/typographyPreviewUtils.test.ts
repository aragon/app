import { typographyPreviewUtils } from './typographyPreviewUtils';

describe('typographyPreview utils', () => {
    afterEach(() => {
        delete document.documentElement.dataset.typography;
        document.cookie = `${typographyPreviewUtils.cookieName}=; path=/; max-age=0`;
    });

    describe('parseFromCookie', () => {
        it('returns the typography stored in the cookie source', () => {
            const cookies = `other=1; ${typographyPreviewUtils.cookieName}=next; another=2`;
            expect(typographyPreviewUtils.parseFromCookie(cookies)).toEqual(
                'next',
            );
        });

        it('returns today when the cookie is missing or holds an unknown value', () => {
            expect(typographyPreviewUtils.parseFromCookie(undefined)).toEqual(
                'today',
            );
            expect(
                typographyPreviewUtils.parseFromCookie(
                    'aragon.debug.themePreview=next',
                ),
            ).toEqual('today');
            expect(
                typographyPreviewUtils.parseFromCookie(
                    `${typographyPreviewUtils.cookieName}=dark`,
                ),
            ).toEqual('today');
        });
    });

    describe('getTypographyAttribute', () => {
        it('returns no attribute for today and the typography name otherwise', () => {
            expect(
                typographyPreviewUtils.getTypographyAttribute('today'),
            ).toBeUndefined();
            expect(
                typographyPreviewUtils.getTypographyAttribute('next'),
            ).toEqual('next');
        });
    });

    describe('getServerTypographyAttribute', () => {
        const cookies = `${typographyPreviewUtils.cookieName}=next`;

        it('returns the stored typography while the debug panel is enabled', () => {
            expect(
                typographyPreviewUtils.getServerTypographyAttribute(
                    true,
                    cookies,
                ),
            ).toEqual('next');
        });

        it('ignores the stored typography when the debug panel is disabled', () => {
            expect(
                typographyPreviewUtils.getServerTypographyAttribute(
                    false,
                    cookies,
                ),
            ).toBeUndefined();
        });
    });

    describe('applyTypography', () => {
        it('sets the typography on the document root and stores it in the cookie', () => {
            typographyPreviewUtils.applyTypography('next');
            expect(document.documentElement.dataset.typography).toEqual('next');
            expect(document.documentElement.dataset.theme).toBeUndefined();
            expect(
                typographyPreviewUtils.parseFromCookie(document.cookie),
            ).toEqual('next');
            expect(typographyPreviewUtils.getCurrentTypography()).toEqual(
                'next',
            );
        });

        it('removes the attribute for today', () => {
            typographyPreviewUtils.applyTypography('next');
            typographyPreviewUtils.applyTypography('today');
            expect(document.documentElement.dataset.typography).toBeUndefined();
            expect(
                typographyPreviewUtils.parseFromCookie(document.cookie),
            ).toEqual('today');
            expect(typographyPreviewUtils.getCurrentTypography()).toEqual(
                'today',
            );
        });
    });
});
