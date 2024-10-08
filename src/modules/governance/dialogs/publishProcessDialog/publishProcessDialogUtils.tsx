import type {
    ICreateProcessFormData,
    ICreateProcessFormStage,
} from '@/modules/governance/components/createProcessForm';
import type { IDaoPlugin } from '@/shared/api/daoService';
import type { TransactionDialogPrepareReturn } from '@/shared/components/transactionDialog';
import { dateUtils, type IDateDuration } from '@/shared/utils/dateUtils';
import { pluginRegistryUtils } from '@/shared/utils/pluginRegistryUtils';
import { transactionUtils } from '@/shared/utils/transactionUtils';
import { invariant } from '@aragon/ods';
import { DateTime, Duration } from 'luxon';
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
        const { process, stages } = formValues;

        const { name, summary } = process;

        return { name, summary, stages };
    };

    buildTransaction = (params: IBuildTransactionParams) => {
        const { values, metadataCid, plugin } = params;

        const actions = this.formToProposalActions(values.actions);
        const metadata = transactionUtils.cidToHex(metadataCid);
        const startDate = this.parseStartDate(values);
        const endDate = this.parseEndDate(values);

        const buildDataFunction = pluginRegistryUtils.getSlotFunction<IBuildCreateProposalDataParams, Hex>({
            pluginId: plugin.subdomain,
            slotId: GovernanceSlotId.GOVERNANCE_BUILD_CREATE_PROPOSAL_DATA,
        })!;

        const buildDataParams: IBuildCreateProposalDataParams = { actions, metadata, startDate, endDate };
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

    prepareActions = async (params: IPrepareActionsParams) => {
        const { actions, prepareActions } = params;

        const prepareActionDataPromises = actions.map(async (action) => {
            const prepareFunction = prepareActions?.[action.actionType as keyof typeof prepareActions];
            const actionData: IProposalAction = (await (prepareFunction != null
                ? prepareFunction(action as unknown as IProposalAction)
                : this.formToProposalActions([action as unknown as IProposalAction])[0])) as IProposalAction;

            return actionData;
        });

        const resolvedActionDataPromises = await Promise.all(prepareActionDataPromises);

        const processedActions = actions.map((action, index) => ({
            ...action,
            data: resolvedActionDataPromises[index],
        }));

        return processedActions;
    };

    private parseStartDate = (formValues: ICreateProposalFormData): number => {
        const { startTimeMode, startTimeFixed } = formValues;

        invariant(
            startTimeMode === 'now' || startTimeFixed != null,
            'PublishProposalDialogUtils.parseStartDate: startTimeFixed must be properly set when startTimeMode is set to fixed',
        );

        // Returning 0 to let the smart contracts set the start time when the transaction is executed.
        if (startTimeMode === 'now') {
            return 0;
        }

        const parsedStartDate = dateUtils.parseFixedDate(startTimeFixed!);

        return this.dateToSeconds(parsedStartDate);
    };

    private parseEndDate = (formValues: ICreateProposalFormData): number => {
        const { startTimeMode, startTimeFixed, endTimeMode, endTimeDuration, endTimeFixed, minimumDuration } =
            formValues;
        const { hours, minutes, days } = endTimeDuration ?? {};

        invariant(
            endTimeMode === 'duration' ? endTimeDuration != null : endTimeFixed != null,
            'PublishProposalDialogUtils.parseEndDate: endTimeDuration/endTimeFixed must be properly set.',
        );

        // Return 0 when endTime is set as duration and equals to minimumDuration to let smart contract set the correct end
        // time when the transaction is executed, otherwise the end time will be set as a few seconds before the minimum
        // duration and the transaction would fail.
        if (endTimeMode === 'duration' && this.compareTimeDuration(minimumDuration, endTimeDuration)) {
            return 0;
        }

        if (endTimeMode === 'duration') {
            const startDate = startTimeMode === 'now' ? DateTime.now() : dateUtils.parseFixedDate(startTimeFixed!);
            const endDate = startDate.plus({ hours, minutes, days });

            return this.dateToSeconds(endDate);
        }

        const parsedEndDate = dateUtils.parseFixedDate(endTimeFixed!);

        return this.dateToSeconds(parsedEndDate);
    };

    private dateToSeconds = (date: DateTime): number => Math.round(date.toMillis() / 1000);

    private formToProposalActions = (actions: IProposalAction[]) =>
        actions.map(({ to, value, data }) => ({ to, value, data }));

    private compareTimeDuration = (first?: IDateDuration, second?: IDateDuration) =>
        Duration.fromObject(first ?? {}).equals(Duration.fromObject(second ?? {}));
}

export const publishProcessDialogUtils = new PublishProcessDialogUtils();
