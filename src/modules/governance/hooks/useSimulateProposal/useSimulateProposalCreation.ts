import type { IDaoPlugin } from '@/shared/api/daoService';
import { invariant } from '@aragon/gov-ui-kit';
import { useQuery } from '@tanstack/react-query';
import { useAccount, usePublicClient } from 'wagmi';
import { publishProposalDialogUtils } from '../../dialogs/publishProposalDialog/publishProposalDialogUtils';

export interface IUseSimulateProposalCreationParams {
    /**
     * Plugin used to create a proposal.
     */
    plugin: IDaoPlugin;
}

const dummyProposal = {
    actions: [],
    title: 'Test title',
    summary: 'Test description',
    body: '',
    addActions: true,
    resources: [],
    startTimeMode: 'now',
};

const dummyCid = 'QmVZjGBGNmkgTsch6E8Eu1EzYJRqZZKQZoc2xRaySanWvs';

/**
 * Simulates a proposal creation transaction to check if the user has permission to create a proposal.
 */
export const useSimulateProposalCreation = (params: IUseSimulateProposalCreationParams) => {
    const { plugin } = params;
    const viemPublicClient = usePublicClient();
    const { address: userAddress } = useAccount();

    const { isSuccess, isLoading } = useQuery({
        queryKey: ['simulateProposal', plugin.address, userAddress],
        queryFn: async () => {
            invariant(viemPublicClient != null, 'useSimulateProposal: Viem client not available');

            const transaction = await publishProposalDialogUtils.buildTransaction({
                proposal: dummyProposal,
                metadataCid: dummyCid,
                plugin,
            });

            const result = await viemPublicClient.call({
                account: userAddress,
                ...transaction,
            });

            return result;
        },
        enabled: !!userAddress,
        retry: false,
    });

    return { isSuccess, isLoading };
};
