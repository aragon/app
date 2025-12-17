'use client';

import { invariant, ProposalDataListItem, ProposalStatus } from '@aragon/gov-ui-kit';
import { useRouter } from 'next/navigation';
import { proposalUtils } from '@/modules/governance/utils/proposalUtils';
import { useDao } from '@/shared/api/daoService';
import { TransactionType } from '@/shared/api/transactionService';
import type { IDialogComponentProps } from '@/shared/components/dialogProvider';
import { type ITransactionDialogStepMeta, TransactionDialog, TransactionDialogStep } from '@/shared/components/transactionDialog';
import { useTranslations } from '@/shared/components/translationsProvider';
import { useStepper } from '@/shared/hooks/useStepper';
import { daoUtils } from '@/shared/utils/daoUtils';
import type { ISppProposal } from '../../types';
import { sppAdvanceStageDialogUtils } from './sppAdvanceStageDialogUtils';

export interface ISppAdvanceStageDialogParams {
    /**
     * Proposal to be advanced to the next step.
     */
    proposal: ISppProposal;
    /**
     * ID of the DAO related to the proposal
     */
    daoId: string;
}

export interface ISppAdvanceStageDialogProps extends IDialogComponentProps<ISppAdvanceStageDialogParams> {}

export const SppAdvanceStageDialog: React.FC<ISppAdvanceStageDialogProps> = (props) => {
    const { location } = props;
    invariant(location.params != null, 'AdvanceStageDialog: required parameters must be set.');

    const { proposal, daoId } = location.params;

    const { t } = useTranslations();
    const router = useRouter();
    const { data: dao } = useDao({ urlParams: { id: daoId } });

    const initialActiveStep = TransactionDialogStep.PREPARE;
    const stepper = useStepper<ITransactionDialogStepMeta, TransactionDialogStep>({ initialActiveStep });

    const handlePrepareTransaction = () => sppAdvanceStageDialogUtils.buildTransaction(proposal);

    const onSuccessClick = () => router.refresh();

    const { address: creatorAddress, ens: creatorEns } = proposal.creator;
    const slug = proposalUtils.getProposalSlug(proposal, dao);

    return (
        <TransactionDialog
            description={t('app.plugins.spp.advanceStageDialog.description')}
            indexingFallbackUrl={daoUtils.getDaoUrl(dao, `proposals/${slug}`)}
            network={proposal.network}
            prepareTransaction={handlePrepareTransaction}
            stepper={stepper}
            submitLabel={t('app.plugins.spp.advanceStageDialog.button.submit')}
            successLink={{
                label: t('app.plugins.spp.advanceStageDialog.button.success'),
                onClick: onSuccessClick,
            }}
            title={t('app.plugins.spp.advanceStageDialog.title')}
            transactionType={TransactionType.PROPOSAL_ADVANCE_STAGE}
        >
            <ProposalDataListItem.Structure
                id={slug}
                publisher={{
                    address: creatorAddress,
                    name: creatorEns ?? undefined,
                }}
                status={ProposalStatus.ACTIVE}
                summary={proposal.summary}
                title={proposal.title}
                type="approvalThreshold"
            />
        </TransactionDialog>
    );
};
