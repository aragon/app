import { useEffect } from 'react';
import { useDebugContext } from '@/shared/components/debugProvider';
import { spacingPreviewUtils } from '../../utils/spacingPreviewUtils';

const SPACING_CONTROL = 'spacingPreview';

/**
 * Registers the spacing preview control of the debug panel, independent of the colour theme and the typography. The
 * panel is only mounted while its feature flag is enabled, so the spacing can only be switched (and is only rendered by
 * the server) for developers.
 */
export const useSpacingPreview = () => {
    const { registerControl, unregisterControl } = useDebugContext();

    useEffect(() => {
        registerControl({
            name: SPACING_CONTROL,
            type: 'select',
            label: 'Spacing (GovKit preview)',
            description:
                'New: every spacing role and control size at its one standard value; documented exceptions follow their role. Looser and compact: the same roles one step more generous or denser (the navigation chrome moves by the smallest step). Works with any colour theme and typography.',
            group: 'Design system',
            value: spacingPreviewUtils.getCurrentSpacing(),
            options: [
                { label: 'Today', value: 'today' },
                { label: 'New', value: 'new' },
                { label: 'New, looser', value: 'looser' },
                { label: 'New, compact', value: 'compact' },
            ],
            onChange: (value) => {
                if (spacingPreviewUtils.isSpacing(value)) {
                    spacingPreviewUtils.applySpacing(value);
                }
            },
        });

        return () => {
            unregisterControl(SPACING_CONTROL);
        };
    }, [registerControl, unregisterControl]);
};
