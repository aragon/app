import { useEffect } from 'react';
import { useDebugContext } from '@/shared/components/debugProvider';
import { themePreviewUtils } from '../../utils/themePreviewUtils';

const THEME_CONTROL = 'themePreview';

/**
 * Registers the colour-theme preview control of the debug panel. The panel is only mounted while its feature flag is
 * enabled, so the theme can only be switched (and is only rendered by the server) for developers.
 */
export const useThemePreview = () => {
    const { registerControl, unregisterControl } = useDebugContext();

    useEffect(() => {
        registerControl({
            name: THEME_CONTROL,
            type: 'select',
            label: 'Colour theme (GovKit preview)',
            description:
                'Next: the new palette, followed by kit components and most app colours. Dark: kit components only, app-owned surfaces are not themed yet.',
            group: 'Design system',
            value: themePreviewUtils.getCurrentTheme(),
            options: [
                { label: 'Today', value: 'today' },
                { label: 'Next', value: 'next' },
                { label: 'Dark (kit components only)', value: 'dark' },
            ],
            onChange: (value) => {
                if (themePreviewUtils.isTheme(value)) {
                    themePreviewUtils.applyTheme(value);
                }
            },
        });

        return () => {
            unregisterControl(THEME_CONTROL);
        };
    }, [registerControl, unregisterControl]);
};
