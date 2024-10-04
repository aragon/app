import { generatePluginSettings } from '@/shared/testUtils';
import { type IMultisigPluginSettings } from '../../types';

export const generateMultisigPluginSettings = (
    settings?: Partial<IMultisigPluginSettings>,
): IMultisigPluginSettings => ({
    ...generatePluginSettings(),
    minApprovals: 2,
    onlyListed: false,
    ...settings,
});
