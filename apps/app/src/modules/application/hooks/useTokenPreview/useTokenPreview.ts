import { useEffect } from 'react';
import { useDebugContext } from '@/shared/components/debugProvider';
import { tokenPreviewUtils } from '../../utils/tokenPreviewUtils';

const { axes, defaultMode } = tokenPreviewUtils;

const controlName = (attribute: string) => `tokenPreview:${attribute}`;

const toOption = (mode: string) => ({
    label: mode.charAt(0).toUpperCase() + mode.slice(1),
    value: mode,
});

/**
 * Registers one debug-panel control per token preview axis. The panel is only mounted while its feature flag is
 * enabled, so a preview can only be switched (and is only rendered by the server) for developers.
 */
export const useTokenPreview = () => {
    const { registerControl, unregisterControl } = useDebugContext();

    useEffect(() => {
        axes.forEach((axis) =>
            registerControl({
                name: controlName(axis.attribute),
                type: 'select',
                label: axis.label,
                group: 'Design system',
                value: tokenPreviewUtils.getCurrentMode(axis),
                options: [defaultMode, ...axis.modes].map(toOption),
                onChange: (value) => tokenPreviewUtils.applyMode(axis, value),
            }),
        );

        return () =>
            axes.forEach((axis) =>
                unregisterControl(controlName(axis.attribute)),
            );
    }, [registerControl, unregisterControl]);
};
