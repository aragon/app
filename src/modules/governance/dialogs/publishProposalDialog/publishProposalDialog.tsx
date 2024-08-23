import { usePinJson } from '@/shared/api/ipfsService/mutations';
import { type IDialogComponentProps } from '@/shared/components/dialogProvider';
import { TransactionDialog, type TransactionDialogStep } from '@/shared/components/transactionDialog';
import type { ITransactionStatusMeta } from '@/shared/components/transactionStatus';
import { useStepper } from '@/shared/hooks/useStepper';
import { DataList, invariant, ProposalDataListItem, ProposalStatus } from '@aragon/ods';
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

    const stepper = useStepper<ITransactionStatusMeta, PublishProposalStep | TransactionDialogStep>({
        initialActiveStep: PublishProposalStep.PIN_METADATA,
    });

    const { status, mutate: pinJson } = usePinJson({ onSuccess: stepper.nextStep });

    const handlePinMetadata = () => pinJson({ body: publishProposalDialogUtils.prepareMetadata() });

    const customSteps = [
        {
            id: PublishProposalStep.PIN_METADATA,
            order: 0,
            meta: { label: 'Pin data on IPFS', errorLabel: 'Unable to pin data on IPFS', state: status },
            action: handlePinMetadata,
            auto: true,
        },
    ];

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
