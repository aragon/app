import { themePreviewUtils } from './themePreviewUtils';

describe('themePreview utils', () => {
    afterEach(() => {
        delete document.documentElement.dataset.theme;
        document.cookie = `${themePreviewUtils.cookieName}=; path=/; max-age=0`;
    });

    describe('parseFromCookie', () => {
        it('returns the theme stored in the cookie source', () => {
            const cookies = `other=1; ${themePreviewUtils.cookieName}=next; another=2`;
            expect(themePreviewUtils.parseFromCookie(cookies)).toEqual('next');
        });

        it('returns today when the cookie is missing or holds an unknown value', () => {
            expect(themePreviewUtils.parseFromCookie(undefined)).toEqual(
                'today',
            );
            expect(themePreviewUtils.parseFromCookie('other=dark')).toEqual(
                'today',
            );
            expect(
                themePreviewUtils.parseFromCookie(
                    `${themePreviewUtils.cookieName}=purple`,
                ),
            ).toEqual('today');
        });
    });

    describe('getThemeAttribute', () => {
        it('returns no attribute for today and the theme name otherwise', () => {
            expect(
                themePreviewUtils.getThemeAttribute('today'),
            ).toBeUndefined();
            expect(themePreviewUtils.getThemeAttribute('next')).toEqual('next');
            expect(themePreviewUtils.getThemeAttribute('dark')).toEqual('dark');
        });
    });

    describe('getServerThemeAttribute', () => {
        const cookies = `${themePreviewUtils.cookieName}=dark`;

        it('returns the stored theme while the debug panel is enabled', () => {
            expect(
                themePreviewUtils.getServerThemeAttribute(true, cookies),
            ).toEqual('dark');
        });

        it('ignores the stored theme when the debug panel is disabled', () => {
            expect(
                themePreviewUtils.getServerThemeAttribute(false, cookies),
            ).toBeUndefined();
        });
    });

    describe('applyTheme', () => {
        it('sets the theme on the document root and stores it in the cookie', () => {
            themePreviewUtils.applyTheme('next');
            expect(document.documentElement.dataset.theme).toEqual('next');
            expect(themePreviewUtils.parseFromCookie(document.cookie)).toEqual(
                'next',
            );
            expect(themePreviewUtils.getCurrentTheme()).toEqual('next');
        });

        it('removes the attribute for today', () => {
            themePreviewUtils.applyTheme('dark');
            themePreviewUtils.applyTheme('today');
            expect(document.documentElement.dataset.theme).toBeUndefined();
            expect(themePreviewUtils.parseFromCookie(document.cookie)).toEqual(
                'today',
            );
            expect(themePreviewUtils.getCurrentTheme()).toEqual('today');
        });
    });
});
