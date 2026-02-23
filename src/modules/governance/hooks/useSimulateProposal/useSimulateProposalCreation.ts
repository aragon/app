import { useCall, useConnection } from 'wagmi';
import type { IDaoPlugin, Network } from '@/shared/api/daoService';
import { networkDefinitions } from '@/shared/constants/networkDefinitions';
import { publishProposalDialogUtils } from '../../dialogs/publishProposalDialog/publishProposalDialogUtils';

export interface IUseSimulateProposalCreationParams {
    /**
     * Plugin used to create a proposal.
     */
    plugin: IDaoPlugin;
    /**
     * Network of the DAO.
     */
    network: Network;
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
export const useSimulateProposalCreation = (
    params: IUseSimulateProposalCreationParams,
) => {
    const { plugin, network } = params;
    const { address: userAddress } = useConnection();
    const { id: chainId } = networkDefinitions[network];

    const transactionData = publishProposalDialogUtils.buildTransaction({
        proposal: dummyProposal,
        metadataCid: dummyCid,
        plugin,
    });

    return useCall({
        account: userAddress,
        chainId,
        ...transactionData,
    });
};
