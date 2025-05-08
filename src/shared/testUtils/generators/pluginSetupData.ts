import type {
    IPluginInstallationSetupData,
    IPluginSetupData,
    IPluginUpdateSetupData,
} from '@/shared/utils/pluginTransactionUtils';
import type { Hex } from 'viem';

export const generatePluginSetupData = (data?: Partial<IPluginSetupData>): IPluginSetupData => ({
    pluginSetupRepo: '0xPluginSetupRepo' as Hex,
    versionTag: { release: 1, build: 1 },
    preparedSetupData: { permissions: [], helpers: [] },
    ...data,
});

export const generatePluginInstallationSetupData = (
    data?: Partial<IPluginInstallationSetupData>,
): IPluginInstallationSetupData => ({
    ...generatePluginSetupData(),
    pluginAddress: '0x' as Hex,
    ...data,
});

export const generatePluginUpdateSetupData = (data?: Partial<IPluginUpdateSetupData>): IPluginUpdateSetupData => ({
    ...generatePluginSetupData(),
    initData: '',
    ...data,
});
