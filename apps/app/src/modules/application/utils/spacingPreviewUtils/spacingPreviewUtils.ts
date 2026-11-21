/**
 * Spacings of the GovKit semantic spacing roles that can be previewed from the debug panel: "today" is the default
 * value set (no attribute), "new" every role at its one standard value, "looser" and "compact" the same roles one step
 * more generous or denser. An axis of its own, independent of the colour theme and the typography (`data-spacing`), so
 * any spacing can be previewed with any of them. Developer-only: the spacing is applied only while the debug panel is
 * enabled.
 */
export type SpacingPreview = 'today' | 'new' | 'looser' | 'compact';

class SpacingPreviewUtils {
    /**
     * Cookie that remembers the previewed spacing between visits. Read on the server, so the page is rendered with the
     * spacing already set (no flash of the default), and only while the debug panel is enabled.
     */
    cookieName = 'aragon.debug.spacingPreview';

    spacings: SpacingPreview[] = ['today', 'new', 'looser', 'compact'];

    isSpacing = (value: unknown): value is SpacingPreview =>
        this.spacings.includes(value as SpacingPreview);

    /**
     * Returns the spacing stored in the cookie header (or `document.cookie`) passed in, "today" when none or invalid.
     */
    parseFromCookie = (cookieSource?: string | null): SpacingPreview => {
        const prefix = `${this.cookieName}=`;
        const cookie = cookieSource
            ?.split(';')
            .map((item) => item.trim())
            .find((item) => item.startsWith(prefix));
        const value = cookie?.slice(prefix.length);

        return this.isSpacing(value) ? value : 'today';
    };

    serializeToCookie = (spacing: SpacingPreview): string =>
        `${this.cookieName}=${spacing}; path=/; max-age=31536000; samesite=lax`;

    /**
     * Value of the `data-spacing` attribute of the document root for the spacing: none for "today".
     */
    getSpacingAttribute = (spacing: SpacingPreview): string | undefined =>
        spacing === 'today' ? undefined : spacing;

    /**
     * Returns the `data-spacing` attribute the server renders on the document root: the stored spacing while the debug
     * panel is enabled, never one otherwise (a stored cookie is ignored for every user without the panel).
     */
    getServerSpacingAttribute = (
        isDebugPanelEnabled: boolean,
        cookieSource?: string | null,
    ): string | undefined =>
        isDebugPanelEnabled
            ? this.getSpacingAttribute(this.parseFromCookie(cookieSource))
            : undefined;

    /**
     * Reads the spacing currently applied on the document root.
     */
    getCurrentSpacing = (): SpacingPreview => {
        const { spacing } = document.documentElement.dataset;

        return this.isSpacing(spacing) ? spacing : 'today';
    };

    /**
     * Applies the spacing to the document root and remembers it in the cookie.
     */
    applySpacing = (spacing: SpacingPreview) => {
        const attribute = this.getSpacingAttribute(spacing);
        const root = document.documentElement;

        if (attribute == null) {
            delete root.dataset.spacing;
        } else {
            root.dataset.spacing = attribute;
        }

        document.cookie = this.serializeToCookie(spacing);
    };
}

export const spacingPreviewUtils = new SpacingPreviewUtils();
