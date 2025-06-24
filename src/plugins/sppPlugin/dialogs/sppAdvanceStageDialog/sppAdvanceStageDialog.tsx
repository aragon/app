'use client';

import { proposalUtils } from '@/modules/governance/utils/proposalUtils';
import { useDao } from '@/shared/api/daoService';
import { TransactionType } from '@/shared/api/transactionService';
import type { IDialogComponentProps } from '@/shared/components/dialogProvider';
import {
    TransactionDialog,
    TransactionDialogStep,
    type ITransactionDialogStepMeta,
} from '@/shared/components/transactionDialog';
import { useTranslations } from '@/shared/components/translationsProvider';
import { useStepper } from '@/shared/hooks/useStepper';
import { daoUtils } from '@/shared/utils/daoUtils';
import { invariant, ProposalDataListItem, ProposalStatus } from '@aragon/gov-ui-kit';
import { useRouter } from 'next/navigation';
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
            title={t('app.plugins.spp.advanceStageDialog.title')}
            description={t('app.plugins.spp.advanceStageDialog.description')}
            submitLabel={t('app.plugins.spp.advanceStageDialog.button.submit')}
            stepper={stepper}
            prepareTransaction={handlePrepareTransaction}
            network={proposal.network}
            successLink={{
                label: t('app.plugins.spp.advanceStageDialog.button.success'),
                onClick: onSuccessClick,
            }}
            transactionType={TransactionType.PROPOSAL_ADVANCE_STAGE}
            indexingFallbackUrl={daoUtils.getDaoUrl(dao, `proposals/${slug}`)}
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
