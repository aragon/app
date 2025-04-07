import type { IDaoPlugin } from '@/shared/api/daoService';
import { pluginRegistryUtils } from '@/shared/utils/pluginRegistryUtils';
import { type ITransactionRequest, transactionUtils } from '@/shared/utils/transactionUtils';
import { type Hex } from 'viem';
import type { IProposalAction } from '../../api/governanceService';
import type {
    ICreateProposalFormData,
    IProposalActionData,
    PrepareProposalActionMap,
} from '../../components/createProposalForm';
import { GovernanceSlotId } from '../../constants/moduleSlots';
import type { IBuildCreateProposalDataParams } from '../../types';

export interface IBuildTransactionParams {
    /**
     * Values of the create-proposal form.
     */
    values: ICreateProposalFormData;
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
    prepareMetadata = (formValues: ICreateProposalFormData) => {
        const { title, summary, body: description, resources } = formValues;

        return { title, summary, description, resources };
    };

    buildTransaction = (params: IBuildTransactionParams): Promise<ITransactionRequest> => {
        const { values, metadataCid, plugin } = params;

        const actions = values.actions.map(this.actionToTransactionRequest);
        const metadata = transactionUtils.cidToHex(metadataCid);

        const buildDataFunction = pluginRegistryUtils.getSlotFunction<IBuildCreateProposalDataParams, Hex>({
            pluginId: plugin.subdomain,
            slotId: GovernanceSlotId.GOVERNANCE_BUILD_CREATE_PROPOSAL_DATA,
        })!;

        const buildDataParams: IBuildCreateProposalDataParams = { actions, metadata, values };
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

    private actionToTransactionRequest = (action: IProposalAction): ITransactionRequest => {
        const { to, value, data } = action;

        return { to: to as Hex, value: BigInt(value), data: data as Hex };
    };
}

export const publishProposalDialogUtils = new PublishProposalDialogUtils();
