import {
    TransactionDialog,
    TransactionDialogStep,
    type ITransactionDialogStepMeta,
} from '@/shared/components/transactionDialog';
import { useTranslations } from '@/shared/components/translationsProvider';
import { useStepper } from '@/shared/hooks/useStepper';
import { Dialog, ProposalDataListItem, ProposalStatus, type IDialogRootProps } from '@aragon/ods';
import { useRouter } from 'next/navigation';
import type { ISppProposal } from '../../types';
import { advanceStageDialogUtils } from './advanceStageDialogUtils';

export interface IAdvanceStageDialogProps extends IDialogRootProps {
    /**
     * Proposal to be advanced to the next step.
     */
    proposal: ISppProposal;
}

export const AdvanceStageDialog: React.FC<IAdvanceStageDialogProps> = (props) => {
    const { proposal } = props;

    const { t } = useTranslations();
    const router = useRouter();

    const initialActiveStep = TransactionDialogStep.PREPARE;
    const stepper = useStepper<ITransactionDialogStepMeta, TransactionDialogStep>({ initialActiveStep });

    const handlePrepareTransaction = () => advanceStageDialogUtils.buildTransaction(proposal);

    const { address: creatorAddress, ens: creatorEns } = proposal.creator;

    return (
        <Dialog.Root {...props}>
            <TransactionDialog
                title={t('app.plugins.spp.advanceStageDialog.title')}
                description={t('app.plugins.spp.advanceStageDialog.description')}
                submitLabel={t('app.plugins.spp.advanceStageDialog.button.submit')}
                stepper={stepper}
                prepareTransaction={handlePrepareTransaction}
                successLink={{
                    label: t('app.plugins.spp.advanceStageDialog.button.success'),
                    action: router.refresh,
                }}
            >
                <ProposalDataListItem.Structure
                    title={proposal.title}
                    summary={proposal.summary}
                    status={ProposalStatus.ACTIVE}
                    type="approvalThreshold"
                    publisher={{ address: creatorAddress, name: creatorEns ?? undefined }}
                />
            </TransactionDialog>
        </Dialog.Root>
    );
};
