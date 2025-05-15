import type { Network } from '@/shared/api/daoService';
import type { IRequestQueryParams } from '@/shared/api/httpService';

export interface IGetPluginInstallationDataQueryParams {
    /**
     * Address of the plugin to fetch the installation data for.
     */
    pluginAddress: string;
    /**
     * Network of the plugin to fetch the installation data for.
     */
    network: Network;
}

export interface IGetPluginInstallationDataParams extends IRequestQueryParams<IGetPluginInstallationDataQueryParams> {}
