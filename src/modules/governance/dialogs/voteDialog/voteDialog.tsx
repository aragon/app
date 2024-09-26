import type { IDialogComponentProps } from '@/shared/components/dialogProvider';
import {
    type ITransactionDialogStepMeta,
    TransactionDialog,
    TransactionDialogStep,
} from '@/shared/components/transactionDialog';
import { useTranslations } from '@/shared/components/translationsProvider';
import { useStepper } from '@/shared/hooks/useStepper';
import { useSupportedDaoPlugin } from '@/shared/hooks/useSupportedDaoPlugin';
import { invariant, type VoteIndicator, VoteProposalDataListItemStructure } from '@aragon/ods';
import { useRouter } from 'next/navigation';
import { useAccount } from 'wagmi';
import { voteDialogUtils } from './voteDialogUtils';

export interface IVoteDialogParams {
    /**
     * ID of the DAO to create the proposal for.
     */
    daoId: string;
    /**
     * vote option
     */
    vote: { value?: number; label: VoteIndicator };
    /**
     * Title of the proposal
     */
    title: string;
    /**
     * Incremental ID of proposal
     */
    proposalIndex: string;
}

export interface IVoteDialogProps extends IDialogComponentProps<IVoteDialogParams> {}

export const VoteDialog: React.FC<IVoteDialogProps> = (props) => {
    const { t } = useTranslations();

    const router = useRouter();

    const { location } = props;

    invariant(location.params != null, 'VoteDialog: required parameters must be set.');

    const { address } = useAccount();
    invariant(address != null, 'VoteDialog: user must be connected.');

    const supportedPlugin = useSupportedDaoPlugin(location.params.daoId);
    invariant(supportedPlugin != null, 'VoteDialog: DAO has no supported plugin.');

    const { title, vote, proposalIndex } = location.params;

    const stepper = useStepper<ITransactionDialogStepMeta, TransactionDialogStep>({
        initialActiveStep: TransactionDialogStep.PREPARE,
    });

    const handlePrepareTransaction = () => {
        return voteDialogUtils.buildTransaction({ proposalIndex, voteValue: vote.value, plugin: supportedPlugin });
    };

    return (
        <TransactionDialog
            title={t('app.governance.voteDialog.title')}
            description={t('app.governance.voteDialog.description')}
            submitLabel={t('app.governance.voteDialog.button.submit')}
            successLink={{ label: t('app.governance.voteDialog.button.success'), action: () => router.refresh() }}
            stepper={stepper}
            prepareTransaction={handlePrepareTransaction}
        >
            <VoteProposalDataListItemStructure
                proposalId={proposalIndex}
                proposalTitle={title}
                voteIndicator={vote.label}
                confirmationLabel={t('app.governance.voteDialog.confirmationLabel')}
            />
        </TransactionDialog>
    );
};
