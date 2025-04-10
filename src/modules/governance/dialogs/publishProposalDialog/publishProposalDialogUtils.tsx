import type { IDaoPlugin } from '@/shared/api/daoService';
import { pluginRegistryUtils } from '@/shared/utils/pluginRegistryUtils';
import { type ITransactionRequest, transactionUtils } from '@/shared/utils/transactionUtils';
import { type Hex } from 'viem';
import type { IProposalActionData, PrepareProposalActionMap } from '../../components/createProposalForm';
import { GovernanceSlotId } from '../../constants/moduleSlots';
import type { IBuildCreateProposalDataParams } from '../../types';
import type { IProposalCreate } from './publishProposalDialog.api';

export interface IBuildTransactionParams {
    /**
     * data for publishing the proposal.
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
    actions: IProposalActionData[];
    /**
     * Partial map of action-type and prepare-action function.
     */
    prepareActions?: PrepareProposalActionMap;
}

class PublishProposalDialogUtils {
    prepareMetadata = (values: IProposalCreate) => {
        const { title, summary, body: description, resources } = values;

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

        const buildDataParams: IBuildCreateProposalDataParams = { actions, metadata, values: proposal };
        const transactionData = buildDataFunction(buildDataParams);
        const transaction = { to: plugin.address as Hex, data: transactionData, value: BigInt(0) };

        return Promise.resolve(transaction);
    };

    prepareActions = async (params: IPrepareActionsParams) => {
        const { actions, prepareActions } = params;

        const prepareActionDataPromises = actions.map(async (action) => {
            const prepareFunction = prepareActions?.[action.type];
            const actionData = await (prepareFunction != null ? prepareFunction(action) : action.data);

            return actionData;
        });

        const resolvedActionDataPromises = await Promise.all(prepareActionDataPromises);

        const processedActions = actions.map((action, index) => ({
            ...action,
            data: resolvedActionDataPromises[index],
        }));

        return processedActions;
    };
}

export const publishProposalDialogUtils = new PublishProposalDialogUtils();
