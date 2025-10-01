import type { Network } from '@/shared/api/daoService';
import type { IRequestQueryParams, IRequestUrlParams } from '@/shared/api/httpService';
import type { EventLogPluginType } from './domain';

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

export interface IGetPluginLogsUrlParams {
    /**
     * Address of the plugin to fetch logs for.
     */
    pluginAddress: string;
    /**
     * Network of the plugin.
     */
    network: Network;
    /**
     * Event type to filter logs by.
     */
    event: EventLogPluginType;
}

export interface IGetPluginLogsParams extends IRequestUrlParams<IGetPluginLogsUrlParams> {}
