import type { IDialogComponentProps } from '@/shared/components/dialogProvider';
import {
    type ITransactionDialogStepMeta,
    TransactionDialog,
    TransactionDialogStep,
} from '@/shared/components/transactionDialog';
import { useStepper } from '@/shared/hooks/useStepper';
import { useSupportedDaoPlugin } from '@/shared/hooks/useSupportedDaoPlugin';
import { invariant } from '@aragon/ods';
import { useAccount } from 'wagmi';

export interface ISubmitVoteParams {
    /**
     * ID of the DAO to create the proposal for.
     */
    daoId: string;
}

export interface ISubmitVoteDialogProps extends IDialogComponentProps<ISubmitVoteParams> {}

export const SubmitVoteDialog: React.FC<ISubmitVoteDialogProps> = (props) => {
    const { location } = props;

    invariant(location.params != null, 'SubmitVoteDialog: required parameters must be set.');

    const { address } = useAccount();
    invariant(address != null, 'SubmitVoteDialog: user must be connected.');

    const supportedPlugin = useSupportedDaoPlugin(location.params.daoId);
    invariant(supportedPlugin != null, 'PublishProposalDialog: DAO has no supported plugin.');

    const stepper = useStepper<ITransactionDialogStepMeta, TransactionDialogStep>({
        initialActiveStep: TransactionDialogStep.PREPARE,
    });

    const handlePrepareTransaction = () => {};

    return (
        <TransactionDialog
            title="Submit vote"
            description="To submit your vote you have to confirm the onchain transaction with your wallet."
            submitLabel="Submit vote"
            successLink={{ label: 'View vote', href: '/governance/proposal/1' }}
            stepper={stepper}
            prepareTransaction={handlePrepareTransaction as any}
        >
            <div>Submit vote dialog content</div>
        </TransactionDialog>
    );
};
