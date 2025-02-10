import type { IPluginSetupData } from '@/shared/utils/pluginTransactionUtils';
import type { Hex } from 'viem';

export const generatePluginSetupData = (pluginSetupData?: Partial<IPluginSetupData>): IPluginSetupData => ({
    pluginSetupRepo: '0xPluginSetupRepo' as Hex,
    versionTag: { release: 1, build: 1 },
    pluginAddress: '0xPluginAddress' as Hex,
    preparedSetupData: {
        permissions: [],
        helpers: [],
    },
    ...pluginSetupData,
});
