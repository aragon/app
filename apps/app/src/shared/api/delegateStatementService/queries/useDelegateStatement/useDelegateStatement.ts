import { useQuery } from '@tanstack/react-query';
import type { IDelegateStatement } from '@/modules/governance/components/delegationStatementCard/delegateStatement.api';
import type { QueryOptions } from '@/shared/types';
import { delegateStatementService } from '../../delegateStatementService';
import { delegateStatementServiceKeys } from '../../delegateStatementServiceKeys';

const IPFS_URI_PREFIX = 'ipfs://';

const stripIpfsPrefix = (cid: string): string =>
    cid.startsWith(IPFS_URI_PREFIX) ? cid.slice(IPFS_URI_PREFIX.length) : cid;

export interface IUseDelegateStatementParams {
    /**
     * Identifier of the pinned statement. Accepts either a bare CID
     * (`Qm...` or `bafy...`) or an `ipfs://`-prefixed URI as returned by
     * the ENS text record.
     */
    cid: string;
}

export const useDelegateStatement = (
    params: IUseDelegateStatementParams,
    options?: QueryOptions<IDelegateStatement>,
) => {
    const normalizedCid = stripIpfsPrefix(params.cid);

    return useQuery<IDelegateStatement>({
        queryKey: delegateStatementServiceKeys.delegateStatement(normalizedCid),
        queryFn: () =>
            delegateStatementService.getDelegateStatement({
                urlParams: { cid: normalizedCid },
            }),
        staleTime: Number.POSITIVE_INFINITY,
        ...options,
    });
};
