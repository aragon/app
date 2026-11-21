import { useEffect } from 'react';
import { useDebugContext } from '@/shared/components/debugProvider';
import { typographyPreviewUtils } from '../../utils/typographyPreviewUtils';

const TYPOGRAPHY_CONTROL = 'typographyPreview';

/**
 * Registers the typography preview control of the debug panel, independent of the colour theme. The panel is only
 * mounted while its feature flag is enabled, so the typography can only be switched (and is only rendered by the
 * server) for developers.
 */
export const useTypographyPreview = () => {
    const { registerControl, unregisterControl } = useDebugContext();

    useEffect(() => {
        registerControl({
            name: TYPOGRAPHY_CONTROL,
            type: 'select',
            label: 'Typography (GovKit preview)',
            description:
                'Next: every type role in its plain bundle, in Sora (display, page to group titles, stats) and Inter Display (the rest); documented exceptions follow their role. Works with any colour theme.',
            group: 'Design system',
            value: typographyPreviewUtils.getCurrentTypography(),
            options: [
                { label: 'Today', value: 'today' },
                { label: 'Next', value: 'next' },
            ],
            onChange: (value) => {
                if (typographyPreviewUtils.isTypography(value)) {
                    typographyPreviewUtils.applyTypography(value);
                }
            },
        });

        return () => {
            unregisterControl(TYPOGRAPHY_CONTROL);
        };
    }, [registerControl, unregisterControl]);
};
