import type { TransactionDialogPrepareReturn } from '@/shared/components/transactionDialog';
import { pluginRegistryUtils } from '@/shared/utils/pluginRegistryUtils';
import { invariant, type IProposalAction } from '@aragon/ods';
import { DateTime } from 'luxon';
import { type Hex, stringToBytes, type TransactionReceipt } from 'viem';
import type { ICreateProposalFormData, ICreateProposalFormFixedDateTime } from '../../components/createProposalForm';
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
     * List of plugin IDs of the DAO.
     */
    pluginIds: string[];
}

class PublishProposalDialogUtils {
    prepareMetadata = (formValues: ICreateProposalFormData) => {
        const { title, summary, body: description, resources } = formValues;

        return { title, summary, description, resources };
    };

    buildTransaction = (params: IBuildTransactionParams) => {
        const { values, metadataCid, pluginIds } = params;

        const actions = this.formToProposalActions(values.actions);
        const metadata = this.metadataToBytes(metadataCid);
        const startDate = this.parseStartDate(values);
        const endDate = this.parseEndDate(values);

        const buildDataFunction = pluginRegistryUtils.getSupportedSlotFunction<IBuildCreateProposalDataParams, Hex>({
            pluginIds: pluginIds,
            slotId: GovernanceSlotId.GOVERNANCE_BUILD_CREATE_PROPOSAL_DATA,
        })!;

        const buildDataParams: IBuildCreateProposalDataParams = { actions, metadata, startDate, endDate };
        const transactionData = buildDataFunction(buildDataParams);

        const transaction: TransactionDialogPrepareReturn = {
            to: '0xF6ad40D5D477ade0C640eaD49944bdD0AA1fBF05',
            data: transactionData,
        };

        return Promise.resolve(transaction);
    };

    getProposalId = (receipt: TransactionReceipt) => receipt.to;

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
        const { startTimeMode, startTimeFixed, endTimeMode, endTimeDuration, endTimeFixed } = formValues;
        const { hours, minutes, days } = endTimeDuration ?? {};

        invariant(
            endTimeMode === 'duration' ? endTimeDuration != null : endTimeFixed != null,
            'PublishProposalDialogUtils.parseEndDate: endTimeDuration/endTimeFixed must be properly set.',
        );

        if (endTimeMode === 'duration') {
            const startDate = startTimeMode === 'now' ? DateTime.now() : this.parseFixedDate(startTimeFixed!);
            const endDate = startDate.plus({ hours, minutes, days });

            return this.dateToSeconds(endDate);
        }

        const parsedEndDate = this.parseFixedDate(endTimeFixed!);

        return this.dateToSeconds(parsedEndDate);
    };

    private parseFixedDate = ({ date, time }: ICreateProposalFormFixedDateTime): DateTime => {
        const { hour, minute } = DateTime.fromISO(time);
        const parsedDate = DateTime.fromISO(date).set({ hour, minute });

        return parsedDate;
    };

    private dateToSeconds = (date: DateTime): number => Math.round(date.toMillis() / 1000);

    private metadataToBytes = (metadataUri: string): Uint8Array => stringToBytes(`ipfs://${metadataUri}`);

    private formToProposalActions = (actions: IProposalAction[]) =>
        actions.map(({ to, value, data }) => ({ to, value, data }));
}

export const publishProposalDialogUtils = new PublishProposalDialogUtils();
