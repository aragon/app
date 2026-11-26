import { tokenPreviewUtils } from './tokenPreviewUtils';

describe('tokenPreview utils', () => {
    const { axes, defaultMode } = tokenPreviewUtils;
    const cookieOf = (mode: string, axis = axes[0]) =>
        `${axis.cookieName}=${mode}`;

    afterEach(() => {
        axes.forEach((axis) => tokenPreviewUtils.applyMode(axis, defaultMode));
    });

    it('names every axis and cookie once', () => {
        expect(new Set(axes.map(({ attribute }) => attribute)).size).toEqual(
            axes.length,
        );
        expect(new Set(axes.map(({ cookieName }) => cookieName)).size).toEqual(
            axes.length,
        );
    });

    describe.each(axes)('$attribute axis', (axis) => {
        const [mode] = axis.modes;

        it('reads a known mode from the cookie source and falls back to the default one', () => {
            const { parseFromCookie } = tokenPreviewUtils;

            expect(
                parseFromCookie(axis, `a=1; ${cookieOf(mode, axis)}; b=2`),
            ).toEqual(mode);
            expect(parseFromCookie(axis, cookieOf('purple', axis))).toEqual(
                defaultMode,
            );
            expect(parseFromCookie(axis, `other=${mode}`)).toEqual(defaultMode);
            expect(parseFromCookie(axis, undefined)).toEqual(defaultMode);
        });

        it('applies a mode to the document root and the cookie, and the default mode removes the attribute', () => {
            const { dataset } = document.documentElement;

            tokenPreviewUtils.applyMode(axis, mode);
            expect(dataset[axis.attribute]).toEqual(mode);
            expect(tokenPreviewUtils.getCurrentMode(axis)).toEqual(mode);
            expect(
                tokenPreviewUtils.parseFromCookie(axis, document.cookie),
            ).toEqual(mode);

            tokenPreviewUtils.applyMode(axis, 'purple');
            expect(dataset[axis.attribute]).toBeUndefined();
            expect(tokenPreviewUtils.getCurrentMode(axis)).toEqual(defaultMode);
            expect(
                tokenPreviewUtils.parseFromCookie(axis, document.cookie),
            ).toEqual(defaultMode);
        });

        it('renders the stored mode on the server only while the debug panel is enabled', () => {
            const cookies = cookieOf(mode, axis);

            expect(
                tokenPreviewUtils.getServerAttributes(true, cookies),
            ).toEqual({ [`data-${axis.attribute}`]: mode });
            expect(
                tokenPreviewUtils.getServerAttributes(false, cookies),
            ).toEqual({});
            expect(tokenPreviewUtils.getServerAttributes(true, null)).toEqual(
                {},
            );
        });
    });
});
