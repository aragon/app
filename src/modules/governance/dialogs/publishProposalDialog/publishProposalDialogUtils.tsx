import type { IDaoPlugin } from '@/shared/api/daoService';
import type {
    IAdvancedDateInputDateDuration,
    IAdvancedDateInputDateFixed,
} from '@/shared/components/advancedDateInput';
import type { TransactionDialogPrepareReturn } from '@/shared/components/transactionDialog';
import { pluginRegistryUtils } from '@/shared/utils/pluginRegistryUtils';
import { invariant, type IProposalAction } from '@aragon/ods';
import { DateTime } from 'luxon';
import { decodeAbiParameters, type Hex, toHex, type TransactionReceipt } from 'viem';
import type { ICreateProposalFormData } from '../../components/createProposalForm';
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

class PublishProposalDialogUtils {
    prepareMetadata = (formValues: ICreateProposalFormData) => {
        const { title, summary, body: description, resources } = formValues;

        return { title, summary, description, resources };
    };

    buildTransaction = (params: IBuildTransactionParams) => {
        const { values, metadataCid, plugin } = params;

        const actions = this.formToProposalActions(values.actions);
        const metadata = this.metadataToHex(metadataCid);
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

        return Promise.resolve(transaction);
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

        const parsedStartDate = this.parseFixedDate(startTimeFixed!);

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

        // Return 0 when startTime is now and endTime equals minimumDuration to let smart contract set the correct end
        // time when the transaction is executed, otherwise the end time will be set as a few seconds before the minimum
        // duration and the transaction would fail.
        if (
            endTimeMode === 'duration' &&
            startTimeMode === 'now' &&
            this.compareTimeDuration(minimumDuration, endTimeDuration)
        ) {
            return 0;
        }

        if (endTimeMode === 'duration') {
            const startDate = startTimeMode === 'now' ? DateTime.now() : this.parseFixedDate(startTimeFixed!);
            const endDate = startDate.plus({ hours, minutes, days });

            return this.dateToSeconds(endDate);
        }

        const parsedEndDate = this.parseFixedDate(endTimeFixed!);

        return this.dateToSeconds(parsedEndDate);
    };

    private parseFixedDate = ({ date, time }: IAdvancedDateInputDateFixed): DateTime => {
        const { hour, minute } = DateTime.fromISO(time);
        const parsedDate = DateTime.fromISO(date).set({ hour, minute });

        return parsedDate;
    };

    private dateToSeconds = (date: DateTime): number => Math.round(date.toMillis() / 1000);

    private metadataToHex = (metadataUri: string): Hex => toHex(`ipfs://${metadataUri}`);

    private formToProposalActions = (actions: IProposalAction[]) =>
        actions.map(({ to, value, data }) => ({ to, value, data }));

    private compareTimeDuration = (first?: IAdvancedDateInputDateDuration, second?: IAdvancedDateInputDateDuration) =>
        first?.days === second?.days && first?.hours === second?.hours && first?.minutes === second?.minutes;
}

export const publishProposalDialogUtils = new PublishProposalDialogUtils();
