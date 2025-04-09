import type { IDaoPlugin } from '@/shared/api/daoService';
import type { ITransactionRequest } from '@/shared/utils/transactionUtils';
import { invariant } from '@aragon/gov-ui-kit';
import type { Hex } from 'viem';
import type { IProposalAction } from '../../api/governanceService';

class ProposalUtils {
    getProposalSlug = (incrementalId?: number, plugin?: IDaoPlugin): string => {
        invariant(
            incrementalId != null && plugin != null,
            'getProposalSlug: Both incrementalId and plugin must be provided.',
        );

        return `${plugin.slug}-${incrementalId.toString()}`.toUpperCase();
    };

    actionToTransactionRequest = (action: IProposalAction): ITransactionRequest => {
        const { to, value, data } = action;

        return { to: to as Hex, value: BigInt(value), data: data as Hex };
    };
}

export const proposalUtils = new ProposalUtils();
