/**
 * Colour themes of the GovKit semantic tokens that can be previewed from the debug panel: "today" is the default
 * value set (no attribute), "next" the designer's light values on the new palette and "dark" the designer's dark
 * values. Developer-only: the theme is applied only while the debug panel is enabled.
 */
export type ThemePreview = 'today' | 'next' | 'dark';

class ThemePreviewUtils {
    /**
     * Cookie that remembers the previewed theme between visits. Read on the server, so the page is rendered with the
     * theme already set (no flash of the default theme), and only while the debug panel is enabled.
     */
    cookieName = 'aragon.debug.themePreview';

    themes: ThemePreview[] = ['today', 'next', 'dark'];

    isTheme = (value: unknown): value is ThemePreview =>
        this.themes.includes(value as ThemePreview);

    /**
     * Returns the theme stored in the cookie header (or `document.cookie`) passed in, "today" when none or invalid.
     */
    parseFromCookie = (cookieSource?: string | null): ThemePreview => {
        const prefix = `${this.cookieName}=`;
        const cookie = cookieSource
            ?.split(';')
            .map((item) => item.trim())
            .find((item) => item.startsWith(prefix));
        const value = cookie?.slice(prefix.length);

        return this.isTheme(value) ? value : 'today';
    };

    serializeToCookie = (theme: ThemePreview): string =>
        `${this.cookieName}=${theme}; path=/; max-age=31536000; samesite=lax`;

    /**
     * Value of the `data-theme` attribute of the document root for the theme: none for "today".
     */
    getThemeAttribute = (theme: ThemePreview): string | undefined =>
        theme === 'today' ? undefined : theme;

    /**
     * Returns the `data-theme` attribute the server renders on the document root: the stored theme while the debug
     * panel is enabled, never a theme otherwise (a stored cookie is ignored for every user without the panel).
     */
    getServerThemeAttribute = (
        isDebugPanelEnabled: boolean,
        cookieSource?: string | null,
    ): string | undefined =>
        isDebugPanelEnabled
            ? this.getThemeAttribute(this.parseFromCookie(cookieSource))
            : undefined;

    /**
     * Reads the theme currently applied on the document root.
     */
    getCurrentTheme = (): ThemePreview => {
        const { theme } = document.documentElement.dataset;

        return this.isTheme(theme) ? theme : 'today';
    };

    /**
     * Applies the theme to the document root and remembers it in the cookie.
     */
    applyTheme = (theme: ThemePreview) => {
        const attribute = this.getThemeAttribute(theme);
        const root = document.documentElement;

        if (attribute == null) {
            delete root.dataset.theme;
        } else {
            root.dataset.theme = attribute;
        }

        document.cookie = this.serializeToCookie(theme);
    };
}

export const themePreviewUtils = new ThemePreviewUtils();
