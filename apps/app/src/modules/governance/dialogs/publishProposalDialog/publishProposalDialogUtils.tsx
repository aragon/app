import type { Hex } from 'viem';
import type { IDaoPlugin } from '@/shared/api/daoService';
import { buildIntentId } from '@/shared/utils/pendingTransactionManager';
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

export interface IBuildProposalIdentityParams {
    /**
     * ID of the DAO the proposal is created for.
     */
    daoId: string;
    /**
     * Plugin used as a target for creating the proposal.
     */
    plugin: IDaoPlugin;
    /**
     * Data for publishing the proposal.
     */
    proposal: IProposalCreate;
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

    // Stable resume identity for a proposal. Hashes a whitelist of content fields (not the prepared
    // calldata, which embeds a now-relative end date) so the id is the same across dialog re-opens and
    // can be recomputed outside the dialog for duplicate detection.
    buildProposalIntentId = (params: IBuildProposalIdentityParams): string => {
        const { daoId, plugin, proposal } = params;

        return buildIntentId({
            daoId,
            plugin: plugin.address,
            title: proposal.title,
            summary: proposal.summary,
            resources: proposal.resources,
            body: proposal.body,
            actions: proposal.actions,
        });
    };

    // Opaque context key (DAO + plugin) used to scope duplicate detection to the same creation target.
    buildProposalScope = (daoId: string, pluginAddress: string): string =>
        `${daoId}:${pluginAddress}`;

    private actionToTransactionRequest = (
        action: IProposalCreateAction,
    ): ITransactionRequest => {
        const { to, value, data } = action;

        return { to: to as Hex, value: BigInt(value), data: data as Hex };
    };
}

export const publishProposalDialogUtils = new PublishProposalDialogUtils();
