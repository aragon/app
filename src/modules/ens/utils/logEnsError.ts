import { monitoringUtils } from '@/shared/utils/monitoringUtils';

export interface IEnsErrorContext {
    chainId?: number;
    hook?: string;
    key?: string;
    name?: string;
    address?: string;
    stage?: string;
}

/**
 * Reports ENS-related failures to Sentry with a shared namespace so they can be
 * filtered and monitored separately from generic RPC noise.
 */
export function logEnsError(error: unknown, context: IEnsErrorContext = {}) {
    monitoringUtils.logError(error, {
        context: {
            module: 'ens',
            ...context,
        },
    });
}
