import { spacingPreviewUtils } from './spacingPreviewUtils';

describe('spacingPreview utils', () => {
    afterEach(() => {
        delete document.documentElement.dataset.spacing;
        document.cookie = `${spacingPreviewUtils.cookieName}=; path=/; max-age=0`;
    });

    describe('parseFromCookie', () => {
        it('returns the spacing stored in the cookie source', () => {
            const cookies = `other=1; ${spacingPreviewUtils.cookieName}=looser; another=2`;
            expect(spacingPreviewUtils.parseFromCookie(cookies)).toEqual(
                'looser',
            );
        });

        it('returns today when the cookie is missing or holds an unknown value', () => {
            expect(spacingPreviewUtils.parseFromCookie(undefined)).toEqual(
                'today',
            );
            expect(
                spacingPreviewUtils.parseFromCookie(
                    'aragon.debug.typographyPreview=next',
                ),
            ).toEqual('today');
            expect(
                spacingPreviewUtils.parseFromCookie(
                    `${spacingPreviewUtils.cookieName}=dense`,
                ),
            ).toEqual('today');
        });
    });

    describe('getSpacingAttribute', () => {
        it('returns no attribute for today and the spacing name otherwise', () => {
            expect(
                spacingPreviewUtils.getSpacingAttribute('today'),
            ).toBeUndefined();
            expect(spacingPreviewUtils.getSpacingAttribute('new')).toEqual(
                'new',
            );
            expect(spacingPreviewUtils.getSpacingAttribute('compact')).toEqual(
                'compact',
            );
        });
    });

    describe('getServerSpacingAttribute', () => {
        const cookies = `${spacingPreviewUtils.cookieName}=compact`;

        it('returns the stored spacing while the debug panel is enabled', () => {
            expect(
                spacingPreviewUtils.getServerSpacingAttribute(true, cookies),
            ).toEqual('compact');
        });

        it('ignores the stored spacing when the debug panel is disabled', () => {
            expect(
                spacingPreviewUtils.getServerSpacingAttribute(false, cookies),
            ).toBeUndefined();
        });
    });

    describe('applySpacing', () => {
        it('sets the spacing on the document root and stores it in the cookie', () => {
            spacingPreviewUtils.applySpacing('new');
            expect(document.documentElement.dataset.spacing).toEqual('new');
            expect(document.documentElement.dataset.typography).toBeUndefined();
            expect(
                spacingPreviewUtils.parseFromCookie(document.cookie),
            ).toEqual('new');
            expect(spacingPreviewUtils.getCurrentSpacing()).toEqual('new');
        });

        it('removes the attribute for today', () => {
            spacingPreviewUtils.applySpacing('looser');
            spacingPreviewUtils.applySpacing('today');
            expect(document.documentElement.dataset.spacing).toBeUndefined();
            expect(
                spacingPreviewUtils.parseFromCookie(document.cookie),
            ).toEqual('today');
            expect(spacingPreviewUtils.getCurrentSpacing()).toEqual('today');
        });
    });
});
