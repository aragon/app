import type { ITokenPluginSettings } from '../../types';

export interface IUseTokenPinnedMembersParams {
    daoId: string;
    pluginAddress: string;
    pluginSettings: ITokenPluginSettings;
}
