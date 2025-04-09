import { proposalUtils } from '@/modules/governance/utils/proposalUtils';
import { TransactionType } from '@/shared/api/transactionService';
import type { IDialogComponentProps } from '@/shared/components/dialogProvider';
import {
    TransactionDialog,
    TransactionDialogStep,
    type ITransactionDialogStepMeta,
} from '@/shared/components/transactionDialog';
import { useTranslations } from '@/shared/components/translationsProvider';
import { useDaoPlugins } from '@/shared/hooks/useDaoPlugins';
import { useStepper } from '@/shared/hooks/useStepper';
import { invariant, ProposalDataListItem, ProposalStatus } from '@aragon/gov-ui-kit';
import { useRouter } from 'next/navigation';
import type { ISppProposal } from '../../types';
import { advanceStageDialogUtils } from './advanceStageDialogUtils';

export interface IAdvanceStageDialogParams {
    /**
     * Proposal to be advanced to the next step.
     */
    proposal: ISppProposal;
    /**
     * ID of the DAO related to the proposal
     */
    daoId: string;
}

export interface IAdvanceStageDialogProps extends IDialogComponentProps<IAdvanceStageDialogParams> {}

export const AdvanceStageDialog: React.FC<IAdvanceStageDialogProps> = (props) => {
    const { location } = props;
    invariant(location.params != null, 'AdvanceStageDialog: required parameters must be set.');

    const { proposal, daoId } = location.params;

    const { t } = useTranslations();
    const router = useRouter();

    const initialActiveStep = TransactionDialogStep.PREPARE;
    const stepper = useStepper<ITransactionDialogStepMeta, TransactionDialogStep>({ initialActiveStep });

    const handlePrepareTransaction = () => advanceStageDialogUtils.buildTransaction(proposal);

    const onSuccessClick = () => {
        router.refresh();
    };

    const handleCloseDialog = () => {
        stepper.updateActiveStep(initialActiveStep);
    };

    const { address: creatorAddress, ens: creatorEns } = proposal.creator;

    const plugin = useDaoPlugins({ daoId, pluginAddress: proposal.pluginAddress, includeSubPlugins: true })?.[0];

    const slug = proposalUtils.getProposalSlug(proposal.incrementalId, plugin?.meta);

    return (
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
            indexingFallbackUrl={`/dao/${daoId}/proposals/${slug}`}
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
    );
};
