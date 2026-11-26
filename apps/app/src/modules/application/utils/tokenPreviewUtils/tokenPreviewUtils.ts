export interface ITokenPreviewAxis {
    /**
     * Key of the `data-*` attribute on the document root that selects the value set ("theme" is `data-theme`).
     */
    attribute: string;
    /**
     * Cookie that remembers the previewed mode between visits.
     */
    cookieName: string;
    /**
     * Label of the debug-panel control.
     */
    label: string;
    /**
     * Preview value sets of the axis, as the kit's preview stylesheet names them.
     */
    modes: string[];
}

/**
 * Preview value sets of the GovKit design tokens, switched from the debug panel. Every axis also has the default mode,
 * which sets no attribute: the values every user gets.
 */
class TokenPreviewUtils {
    defaultMode = 'today';

    axes: ITokenPreviewAxis[] = [
        {
            attribute: 'theme',
            cookieName: 'aragon.debug.themePreview',
            label: 'Colour theme',
            modes: ['next', 'dark'],
        },
        {
            attribute: 'typography',
            cookieName: 'aragon.debug.typographyPreview',
            label: 'Typography',
            modes: ['next'],
        },
    ];

    /**
     * Returns the mode of the axis stored in the cookie header (or `document.cookie`) passed in, the default mode
     * when none or unknown.
     */
    parseFromCookie = (
        axis: ITokenPreviewAxis,
        cookieSource?: string | null,
    ): string => {
        const prefix = `${axis.cookieName}=`;
        const cookie = cookieSource
            ?.split(';')
            .map((item) => item.trim())
            .find((item) => item.startsWith(prefix));

        return this.toMode(axis, cookie?.slice(prefix.length));
    };

    /**
     * Returns the `data-*` attributes the server renders on the document root: the stored modes while the debug
     * panel is enabled, none otherwise (a stored cookie is ignored for every user without the panel).
     */
    getServerAttributes = (
        isDebugPanelEnabled: boolean,
        cookieSource?: string | null,
    ): Record<string, string> => {
        if (!isDebugPanelEnabled) {
            return {};
        }

        const attributes = this.axes
            .map(
                (axis) =>
                    [axis, this.parseFromCookie(axis, cookieSource)] as const,
            )
            .filter(([, mode]) => mode !== this.defaultMode)
            .map(([axis, mode]) => [`data-${axis.attribute}`, mode]);

        return Object.fromEntries(attributes);
    };

    /**
     * Reads the mode of the axis currently applied on the document root.
     */
    getCurrentMode = (axis: ITokenPreviewAxis): string =>
        this.toMode(axis, document.documentElement.dataset[axis.attribute]);

    /**
     * Applies the mode to the document root and remembers it in the cookie. An unknown mode applies the default one.
     */
    applyMode = (axis: ITokenPreviewAxis, value: unknown) => {
        const mode = this.toMode(axis, value);
        const { dataset } = document.documentElement;

        if (mode === this.defaultMode) {
            delete dataset[axis.attribute];
        } else {
            dataset[axis.attribute] = mode;
        }

        document.cookie = `${axis.cookieName}=${mode}; path=/; max-age=31536000; samesite=lax`;
    };

    private readonly toMode = (
        axis: ITokenPreviewAxis,
        value: unknown,
    ): string => axis.modes.find((mode) => mode === value) ?? this.defaultMode;
}

export const tokenPreviewUtils = new TokenPreviewUtils();
