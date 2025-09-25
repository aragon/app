import type { IDaoPlugin } from '@/shared/api/daoService';
import { useAccount, useCall } from 'wagmi';
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
    const { address: userAddress } = useAccount();

    const transactionData = publishProposalDialogUtils.buildTransaction({
        proposal: dummyProposal,
        metadataCid: dummyCid,
        plugin,
    });

    return useCall({
        account: userAddress,
        ...transactionData,
    });
};
