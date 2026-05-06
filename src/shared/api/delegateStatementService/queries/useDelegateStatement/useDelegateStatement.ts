import { useQuery } from '@tanstack/react-query';
import type { IDelegateStatement } from '@/modules/governance/components/delegationStatementCard/delegateStatement.api';
import type { QueryOptions } from '@/shared/types';
import { delegateStatementService } from '../../delegateStatementService';
import { delegateStatementServiceKeys } from '../../delegateStatementServiceKeys';

const IPFS_URI_PREFIX = 'ipfs://';

const stripIpfsPrefix = (cid: string | null | undefined): string => {
    if (cid == null) {
        return '';
    }
    return cid.startsWith(IPFS_URI_PREFIX)
        ? cid.slice(IPFS_URI_PREFIX.length)
        : cid;
};

export interface IUseDelegateStatementParams {
    /**
     * Identifier of the pinned statement. Accepts either a bare CID
     * (`Qm...` or `bafy...`) or an `ipfs://`-prefixed URI as returned by
     * the ENS text record. The hook is disabled when nullish or empty so
     * callers can pass the result of `useDelegateStatementCid` directly
     * without an extra guard.
     */
    cid: string | null | undefined;
}

export const useDelegateStatement = (
    params: IUseDelegateStatementParams,
    options?: QueryOptions<IDelegateStatement>,
) => {
    const normalizedCid = stripIpfsPrefix(params.cid);
    const isEnabled = normalizedCid.length > 0;

    return useQuery<IDelegateStatement>({
        queryKey: delegateStatementServiceKeys.delegateStatement(normalizedCid),
        queryFn: () => {
            if (!isEnabled) {
                throw new Error(
                    'useDelegateStatement queryFn ran without a CID',
                );
            }
            return delegateStatementService.getDelegateStatement({
                urlParams: { cid: normalizedCid },
            });
        },
        enabled: isEnabled,
        staleTime: Number.POSITIVE_INFINITY,
        ...options,
    });
};
