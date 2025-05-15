import type {
    IPluginInstallationSetupData,
    IPluginSetupData,
    IPluginUpdateSetupData,
} from '@/shared/utils/pluginTransactionUtils';

export const generatePluginSetupData = (data?: Partial<IPluginSetupData>): IPluginSetupData => ({
    pluginSetupRepo: '0xPluginSetupRepo',
    versionTag: { release: 1, build: 1 },
    preparedSetupData: { permissions: [], helpers: [] },
    ...data,
});

export const generatePluginInstallationSetupData = (
    data?: Partial<IPluginInstallationSetupData>,
): IPluginInstallationSetupData => ({
    ...generatePluginSetupData(),
    pluginAddress: '0x',
    ...data,
});

export const generatePluginUpdateSetupData = (data?: Partial<IPluginUpdateSetupData>): IPluginUpdateSetupData => ({
    ...generatePluginSetupData(),
    initData: '0x',
    ...data,
});
