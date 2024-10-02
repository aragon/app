import { type IPluginSettings } from '@/shared/api/daoService';
import { useSupportedDaoPlugin } from '../useSupportedDaoPlugin';

export interface IUsePluginSettingsParams {
    /**
     * Id of the DAO.
     */
    daoId: string;
}

/**
 * @deprecated Use the settings from the plugin object instead to support multi-plugin DAOs
 */
export const usePluginSettings = <TSettings extends IPluginSettings = IPluginSettings>(
    params: IUsePluginSettingsParams,
): TSettings | undefined => {
    const { daoId } = params;
    const supportedPlugin = useSupportedDaoPlugin(daoId);

    return supportedPlugin?.settings as TSettings | undefined;
};
