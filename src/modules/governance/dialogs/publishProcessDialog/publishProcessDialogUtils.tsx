import type {
    ICreateProcessFormData,
    ICreateProcessFormStage,
} from '@/modules/governance/components/createProcessForm';
import type { IDaoPlugin } from '@/shared/api/daoService';
import type { TransactionDialogPrepareReturn } from '@/shared/components/transactionDialog';
import { pluginRegistryUtils } from '@/shared/utils/pluginRegistryUtils';
import { transactionUtils } from '@/shared/utils/transactionUtils';
import { decodeAbiParameters, type Hex, type TransactionReceipt } from 'viem';
import type { IProposalAction } from '../../api/governanceService';
import type { ICreateProposalFormData, PrepareProposalActionMap } from '../../components/createProposalForm';
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
    actions: ICreateProcessFormStage[];
    /**
     * Partial map of action-type and prepare-action function.
     */
    prepareActions?: PrepareProposalActionMap;
}

class PublishProcessDialogUtils {
    prepareMetadata = (formValues: ICreateProcessFormData) => {
        const { name, description, stages } = formValues;

        return { name, description, stages };
    };

    buildTransaction = (params: IBuildTransactionParams) => {
        const { values, metadataCid, plugin } = params;

        const actions = this.formToProposalActions(values.actions);
        const metadata = transactionUtils.cidToHex(metadataCid);

        const buildDataFunction = pluginRegistryUtils.getSlotFunction<IBuildCreateProposalDataParams, Hex>({
            pluginId: plugin.subdomain,
            slotId: GovernanceSlotId.GOVERNANCE_BUILD_CREATE_PROPOSAL_DATA,
        })!;

        const buildDataParams: IBuildCreateProposalDataParams = { actions, metadata, values };
        const transactionData = buildDataFunction(buildDataParams);

        const transaction: TransactionDialogPrepareReturn = {
            to: plugin.address as Hex,
            data: transactionData,
        };

        return transaction;
    };

    getProposalId = (receipt: TransactionReceipt) => {
        const proposalIdTopic = receipt.logs[0].topics[1]!;
        const decodedParams = decodeAbiParameters(
            [{ name: 'proposalId', internalType: 'uint256', type: 'uint256', indexed: true }],
            proposalIdTopic,
        );

        const decodedProposalId = decodedParams[0].toString();

        return decodedProposalId;
    };

    private formToProposalActions = (actions: IProposalAction[]) =>
        actions.map(({ to, value, data }) => ({ to, value, data }));
}

export const publishProcessDialogUtils = new PublishProcessDialogUtils();
