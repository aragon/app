import type {
    IPluginInstallationSetupData,
    IPluginSetupData,
    IPluginUninstallSetupData,
    IPluginUpdateSetupData,
} from '@/shared/utils/pluginTransactionUtils';

export const generatePluginSetupData = (data?: Partial<IPluginSetupData>): IPluginSetupData => ({
    pluginSetupRepo: '0xPluginSetupRepo',
    versionTag: { release: 1, build: 1 },
    ...data,
});

export const generatePluginInstallationSetupData = (
    data?: Partial<IPluginInstallationSetupData>,
): IPluginInstallationSetupData => ({
    ...generatePluginSetupData(),
    pluginAddress: '0x',
    preparedSetupData: { permissions: [], helpers: [] },
    ...data,
});

export const generatePluginUpdateSetupData = (data?: Partial<IPluginUpdateSetupData>): IPluginUpdateSetupData => ({
    ...generatePluginSetupData(),
    initData: '0x',
    preparedSetupData: { permissions: [], helpers: [] },
    ...data,
});

export const generatePluginUninstallSetupData = (
    data?: Partial<IPluginUninstallSetupData>,
): IPluginUninstallSetupData => ({
    ...generatePluginSetupData(),
    pluginAddress: '0x',
    permissions: [],
    ...data,
});
