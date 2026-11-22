/**
 * Typographies of the GovKit semantic type roles that can be previewed from the debug panel: "today" is the default
 * value set (no attribute), "next" the plain role bundles in the designer's faces (Sora, Inter Display). An axis of its
 * own, independent of the colour theme (`data-typography`, not `data-theme`), so any typography can be previewed with
 * any colours. Developer-only: the typography is applied only while the debug panel is enabled.
 */
export type TypographyPreview = 'today' | 'next';

class TypographyPreviewUtils {
    /**
     * Cookie that remembers the previewed typography between visits. Read on the server, so the page is rendered with
     * the typography already set (no flash of the default), and only while the debug panel is enabled.
     */
    cookieName = 'aragon.debug.typographyPreview';

    typographies: TypographyPreview[] = ['today', 'next'];

    isTypography = (value: unknown): value is TypographyPreview =>
        this.typographies.includes(value as TypographyPreview);

    /**
     * Returns the typography stored in the cookie header (or `document.cookie`) passed in, "today" when none or invalid.
     */
    parseFromCookie = (cookieSource?: string | null): TypographyPreview => {
        const prefix = `${this.cookieName}=`;
        const cookie = cookieSource
            ?.split(';')
            .map((item) => item.trim())
            .find((item) => item.startsWith(prefix));
        const value = cookie?.slice(prefix.length);

        return this.isTypography(value) ? value : 'today';
    };

    serializeToCookie = (typography: TypographyPreview): string =>
        `${this.cookieName}=${typography}; path=/; max-age=31536000; samesite=lax`;

    /**
     * Value of the `data-typography` attribute of the document root for the typography: none for "today".
     */
    getTypographyAttribute = (
        typography: TypographyPreview,
    ): string | undefined => (typography === 'today' ? undefined : typography);

    /**
     * Returns the `data-typography` attribute the server renders on the document root: the stored typography while
     * the debug panel is enabled, never one otherwise (a stored cookie is ignored for every user without the panel).
     */
    getServerTypographyAttribute = (
        isDebugPanelEnabled: boolean,
        cookieSource?: string | null,
    ): string | undefined =>
        isDebugPanelEnabled
            ? this.getTypographyAttribute(this.parseFromCookie(cookieSource))
            : undefined;

    /**
     * Reads the typography currently applied on the document root.
     */
    getCurrentTypography = (): TypographyPreview => {
        const { typography } = document.documentElement.dataset;

        return this.isTypography(typography) ? typography : 'today';
    };

    /**
     * Applies the typography to the document root and remembers it in the cookie.
     */
    applyTypography = (typography: TypographyPreview) => {
        const attribute = this.getTypographyAttribute(typography);
        const root = document.documentElement;

        if (attribute == null) {
            delete root.dataset.typography;
        } else {
            root.dataset.typography = attribute;
        }

        document.cookie = this.serializeToCookie(typography);
    };
}

export const typographyPreviewUtils = new TypographyPreviewUtils();
