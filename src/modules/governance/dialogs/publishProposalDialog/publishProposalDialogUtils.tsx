import type { Hex } from 'viem';
import type { IDaoPlugin } from '@/shared/api/daoService';
import { pluginRegistryUtils } from '@/shared/utils/pluginRegistryUtils';
import {
    type ITransactionRequest,
    transactionUtils,
} from '@/shared/utils/transactionUtils';
import { GovernanceSlotId } from '../../constants/moduleSlots';
import type { IBuildCreateProposalDataParams } from '../../types';
import { proposalActionPreparationUtils } from '../../utils/proposalActionPreparationUtils';
import type {
    IProposalCreate,
    IProposalCreateAction,
} from './publishProposalDialog.api';

export interface IBuildTransactionParams {
    /**
     * Data for publishing the proposal.
     */
    proposal: IProposalCreate;
    /**
     * CID of the proposal metadata pinned on IPFS.
     */
    metadataCid: string;
    /**
     * Plugin of the DAO to interact with.
     */
    plugin: IDaoPlugin;
}

class PublishProposalDialogUtils {
    prepareMetadata = (proposal: IProposalCreate) => {
        const { title, summary, body: description, resources } = proposal;

        return { title, summary, description, resources };
    };

    buildTransaction = (
        params: IBuildTransactionParams,
    ): ITransactionRequest => {
        const { proposal, metadataCid, plugin } = params;
        const { actions } = proposal;

        const metadata = transactionUtils.stringToMetadataHex(metadataCid);

        const buildDataFunction = pluginRegistryUtils.getSlotFunction<
            IBuildCreateProposalDataParams,
            Hex
        >({
            pluginId: plugin.interfaceType,
            slotId: GovernanceSlotId.GOVERNANCE_BUILD_CREATE_PROPOSAL_DATA,
        })!;

        const parsedActions = actions.map(this.actionToTransactionRequest);
        const buildDataParams: IBuildCreateProposalDataParams = {
            actions: parsedActions,
            metadata,
            proposal,
            plugin,
        };
        const transactionData = buildDataFunction(buildDataParams);
        const transaction = {
            to: plugin.address as Hex,
            data: transactionData,
            value: BigInt(0),
        };

        return transaction;
    };

    prepareActions = proposalActionPreparationUtils.prepareActions;

    private actionToTransactionRequest = (
        action: IProposalCreateAction,
    ): ITransactionRequest => {
        const { to, value, data } = action;

        return { to: to as Hex, value: BigInt(value), data: data as Hex };
    };
}

export const publishProposalDialogUtils = new PublishProposalDialogUtils();
