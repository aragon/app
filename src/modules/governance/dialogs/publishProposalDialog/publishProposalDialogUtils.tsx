import type { IDaoPlugin } from '@/shared/api/daoService';
import { pluginRegistryUtils } from '@/shared/utils/pluginRegistryUtils';
import { type ITransactionRequest, transactionUtils } from '@/shared/utils/transactionUtils';
import { type Hex } from 'viem';
import { GovernanceSlotId } from '../../constants/moduleSlots';
import type { IBuildCreateProposalDataParams } from '../../types';
import type { IProposalCreate, IProposalCreateAction, PrepareProposalActionMap } from './publishProposalDialog.api';

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

export interface IPrepareActionsParams {
    /**
     * List of actions of the proposal.
     */
    actions: IProposalCreateAction[];
    /**
     * Partial map of action-type and prepare-action function.
     */
    prepareActions?: PrepareProposalActionMap;
}

class PublishProposalDialogUtils {
    prepareMetadata = (proposal: IProposalCreate) => {
        const { title, summary, body: description, resources } = proposal;

        return { title, summary, description, resources };
    };

    buildTransaction = (params: IBuildTransactionParams): Promise<ITransactionRequest> => {
        const { proposal, metadataCid, plugin } = params;
        const { actions } = proposal;

        const metadata = transactionUtils.cidToHex(metadataCid);

        const buildDataFunction = pluginRegistryUtils.getSlotFunction<IBuildCreateProposalDataParams, Hex>({
            pluginId: plugin.subdomain,
            slotId: GovernanceSlotId.GOVERNANCE_BUILD_CREATE_PROPOSAL_DATA,
        })!;

        const parsedActions = actions.map(this.actionToTransactionRequest);
        const buildDataParams: IBuildCreateProposalDataParams = { actions: parsedActions, metadata, proposal, plugin };
        const transactionData = buildDataFunction(buildDataParams);
        const transaction = { to: plugin.address as Hex, data: transactionData, value: BigInt(0) };

        return Promise.resolve(transaction);
    };

    prepareActions = async (params: IPrepareActionsParams) => {
        const { actions, prepareActions } = params;

        const prepareActionDataPromises = actions.map(async (action) => {
            const prepareFunction = action.type ? prepareActions?.[action.type] : undefined;
            const actionData = await (prepareFunction != null ? prepareFunction(action) : action.data);

            return actionData;
        });

        const resolvedActionDataPromises = (await Promise.all(prepareActionDataPromises)) as Hex[];

        const processedActions = actions.map((action, index) => ({
            ...action,
            data: resolvedActionDataPromises[index],
        }));

        return processedActions;
    };

    private actionToTransactionRequest = (action: IProposalCreateAction): ITransactionRequest => {
        const { to, value, data } = action;

        return { to: to as Hex, value: BigInt(value), data: data as Hex };
    };
}

export const publishProposalDialogUtils = new PublishProposalDialogUtils();
