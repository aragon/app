import { usePinJson } from '@/shared/api/ipfsService/mutations';
import { type IDialogComponentProps } from '@/shared/components/dialogProvider';
import {
    type ITransactionDialogActionParams,
    type ITransactionDialogStep,
    type ITransactionDialogStepMeta,
    TransactionDialog,
    type TransactionDialogStep,
} from '@/shared/components/transactionDialog';
import { useStepper } from '@/shared/hooks/useStepper';
import { DataList, invariant, ProposalDataListItem, ProposalStatus } from '@aragon/ods';
import { useCallback, useMemo } from 'react';
import type { ICreateProposalFormData } from '../../components/createProposalForm';
import { publishProposalDialogUtils } from './publishProposalDialogUtils';

export enum PublishProposalStep {
    PIN_METADATA = 'PIN_METADATA',
}

export interface IPublishProposalDialogProps extends IDialogComponentProps<ICreateProposalFormData> {}

export const PublishProposalDialog: React.FC<IPublishProposalDialogProps> = (props) => {
    const { location } = props;
    const { params: formValues } = location;

    invariant(formValues != null, 'PublishProposalDialog: formValues parameter must not be undefined.');
    const { title, summary } = formValues;

    const stepper = useStepper<ITransactionDialogStepMeta, PublishProposalStep | TransactionDialogStep>({
        initialActiveStep: PublishProposalStep.PIN_METADATA,
    });

    const { status, mutate: pinJson } = usePinJson({ onSuccess: stepper.nextStep });

    const handlePinJson = useCallback(
        (params: ITransactionDialogActionParams) => {
            const proposalMetadata = publishProposalDialogUtils.prepareMetadata();
            pinJson({ body: proposalMetadata }, params);
        },
        [pinJson],
    );

    const customSteps: Array<ITransactionDialogStep<PublishProposalStep>> = useMemo(
        () => [
            {
                id: PublishProposalStep.PIN_METADATA,
                order: 0,
                meta: {
                    label: 'Pin data on IPFS',
                    errorLabel: 'Unable to pin data on IPFS',
                    state: status,
                    action: handlePinJson,
                    auto: true,
                },
            },
        ],
        [status, handlePinJson],
    );

    return (
        <TransactionDialog<PublishProposalStep>
            title="Publish proposal"
            description="To publish your proposal you have to confirm the onchain transaction with your wallet."
            submitLabel="Publish proposal"
            stepper={stepper}
            customSteps={customSteps}
            prepareTransaction={publishProposalDialogUtils.buildTransaction}
        >
            <DataList.Root entityLabel="">
                <ProposalDataListItem.Structure
                    title={title}
                    summary={summary}
                    publisher={{ address: '' }}
                    status={ProposalStatus.DRAFT}
                    type="majorityVoting"
                />
            </DataList.Root>
        </TransactionDialog>
    );
};
