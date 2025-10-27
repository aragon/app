import type { Network } from '@/shared/api/daoService';

export interface IUseEpochMetricsParams {
    /**
     * Parameters for the epoch metrics query.
     */
    queryParams: {
        pluginAddress: string;
        network: Network;
    };
    /**
     * Whether to enable the query. Defaults to true.
     */
    enabled?: boolean;
}
