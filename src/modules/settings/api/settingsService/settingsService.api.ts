import type { IRequestUrlParams } from '@/shared/api/httpService';

export interface IGetPluginInstallationDataUrlParams {
    /**
     * Address of the plugin to fetch the installation data for.
     */
    address: string;
}

export interface IGetPluginInstallationDataParams extends IRequestUrlParams<IGetPluginInstallationDataUrlParams> {}
