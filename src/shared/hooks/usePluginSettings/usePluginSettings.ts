import { type IPluginSettings, useDao } from '@/shared/api/daoService';

export interface IUsePluginSettingsParams {
    /**
     * Id of the DAO.
     */
    daoId: string;
}

export const usePluginSettings = <TSettings extends IPluginSettings = IPluginSettings>(
    params: IUsePluginSettingsParams,
): TSettings | undefined => {
    const { daoId } = params;

    const daoParams = { id: daoId };
    const { data: dao } = useDao({ urlParams: daoParams });

    return dao?.plugins[0].settings as TSettings | undefined;
};
