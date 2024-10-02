import { type IPluginSettings } from '@/shared/api/daoService';
import { useSupportedDaoPlugin } from '../useSupportedDaoPlugin';
import { generatePluginSettings } from '@/shared/testUtils';
import { daoMock } from '@/shared/api/daoService/daoService';

export interface IUsePluginSettingsParams {
    /**
     * Id of the DAO.
     */
    daoId: string;
    /**
     * plugin address
     */
    pluginAddress?: string;
}

export const settingsMock: IPluginSettings = generatePluginSettings({
    stages: [
        { id: '0', name: 'Token holder voting', plugins: [daoMock.plugins[2]], votingPeriod: 432000 },
        { id: '1', name: 'Founders approval', plugins: [daoMock.plugins[1]], votingPeriod: 604800 },
    ],
});

export const usePluginSettings = <TSettings extends IPluginSettings = IPluginSettings>(
    params: IUsePluginSettingsParams,
): TSettings | undefined => {
    const { daoId } = params;
    const supportedPlugin = useSupportedDaoPlugin(daoId);

    if (daoId === 'ethereum-mainnet-0xEC10f0f223e52F2d939C7372b62EF2F55173282F') {
        return settingsMock as TSettings;
    }

    return supportedPlugin?.settings as TSettings | undefined;
};
