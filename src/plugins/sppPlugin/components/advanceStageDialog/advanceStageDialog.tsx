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

    const stepper = useStepper<ITransactionDialogStepMeta, TransactionDialogStep>({
        initialActiveStep: TransactionDialogStep.PREPARE,
    });

    const handlePrepareTransaction = () => advanceStageDialogUtils.buildTransaction(proposal);

    return (
        <Dialog.Root {...props}>
            <TransactionDialog
                title={t('app.plugins.spp.advanceStageDialog.title')}
                description={t('app.plugins.spp.advanceStageDialog.description')}
                submitLabel={t('app.plugins.spp.advanceStageDialog.button.submit')}
                successLink={{
                    label: t('app.plugins.spp.advanceStageDialog.button.success'),
                    action: () => router.refresh(),
                }}
                stepper={stepper}
                prepareTransaction={handlePrepareTransaction}
            >
                <Dialog.Content>
                    <ProposalDataListItem.Structure
                        id={proposal.proposalIndex}
                        title={proposal.title}
                        summary={proposal.summary}
                        // TODO: set correct status
                        status={ProposalStatus.ACCEPTED}
                        type="approvalThreshold"
                        publisher={{
                            address: proposal.creator.address,
                            name: proposal.creator.ens ?? undefined,
                        }}
                    />
                </Dialog.Content>
            </TransactionDialog>
        </Dialog.Root>
    );
};
