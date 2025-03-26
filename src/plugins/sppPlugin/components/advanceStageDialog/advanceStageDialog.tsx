import { proposalUtils } from '@/modules/governance/utils/proposalUtils';
import { TransactionType } from '@/shared/api/transactionService/transactionService.api';
import {
    TransactionDialog,
    TransactionDialogStep,
    type ITransactionDialogStepMeta,
} from '@/shared/components/transactionDialog';
import { useTranslations } from '@/shared/components/translationsProvider';
import { useDaoPlugins } from '@/shared/hooks/useDaoPlugins';
import { useStepper } from '@/shared/hooks/useStepper';
import { Dialog, ProposalDataListItem, ProposalStatus, type IDialogRootProps } from '@aragon/gov-ui-kit';
import { useRouter } from 'next/navigation';
import type { ISppProposal } from '../../types';
import { advanceStageDialogUtils } from './advanceStageDialogUtils';

export interface IAdvanceStageDialogProps extends IDialogRootProps {
    /**
     * Proposal to be advanced to the next step.
     */
    proposal: ISppProposal;
    /**
     * ID of the DAO related to the proposal
     */
    daoId: string;
}

export const AdvanceStageDialog: React.FC<IAdvanceStageDialogProps> = (props) => {
    const { proposal, onOpenChange, daoId, ...otherProps } = props;

    const { t } = useTranslations();
    const router = useRouter();

    const initialActiveStep = TransactionDialogStep.PREPARE;
    const stepper = useStepper<ITransactionDialogStepMeta, TransactionDialogStep>({ initialActiveStep });

    const handlePrepareTransaction = () => advanceStageDialogUtils.buildTransaction(proposal);

    const onSuccessClick = () => {
        router.refresh();
        onOpenChange?.(false);
    };

    const handleCloseDialog = () => {
        onOpenChange?.(false);
        stepper.updateActiveStep(initialActiveStep);
    };

    const { address: creatorAddress, ens: creatorEns } = proposal.creator;

    const plugin = useDaoPlugins({ daoId, pluginAddress: proposal.pluginAddress, includeSubPlugins: true })?.[0];

    const slug = proposalUtils.getProposalSlug(proposal.incrementalId, plugin?.meta);

    const handlePreventClose = (e: Event) => {
        e.preventDefault();
    };

    return (
        <Dialog.Root
            onInteractOutside={handlePreventClose}
            onEscapeKeyDown={handlePreventClose}
            onOpenChange={handleCloseDialog}
            {...otherProps}
        >
            <TransactionDialog
                title={t('app.plugins.spp.advanceStageDialog.title')}
                description={t('app.plugins.spp.advanceStageDialog.description')}
                submitLabel={t('app.plugins.spp.advanceStageDialog.button.submit')}
                stepper={stepper}
                prepareTransaction={handlePrepareTransaction}
                onCancelClick={handleCloseDialog}
                network={proposal.network}
                successLink={{
                    label: t('app.plugins.spp.advanceStageDialog.button.success'),
                    onClick: onSuccessClick,
                }}
                transactionType={TransactionType.PROPOSAL_ADVANCE_STAGE}
            >
                <ProposalDataListItem.Structure
                    title={proposal.title}
                    summary={proposal.summary}
                    status={ProposalStatus.ACTIVE}
                    type="approvalThreshold"
                    publisher={{ address: creatorAddress, name: creatorEns ?? undefined }}
                    id={slug}
                />
            </TransactionDialog>
        </Dialog.Root>
    );
};
