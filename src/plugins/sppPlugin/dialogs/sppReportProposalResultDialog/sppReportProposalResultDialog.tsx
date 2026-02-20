'use client';

import {
    invariant,
    VoteProposalDataListItemStructure,
} from '@aragon/gov-ui-kit';
import { useRouter } from 'next/navigation';
import { useConnection } from 'wagmi';
import { proposalUtils } from '@/modules/governance/utils/proposalUtils';
import { useDao } from '@/shared/api/daoService';
import { TransactionType } from '@/shared/api/transactionService';
import type { IDialogComponentProps } from '@/shared/components/dialogProvider';
import {
    type ITransactionDialogStepMeta,
    TransactionDialog,
    TransactionDialogStep,
} from '@/shared/components/transactionDialog';
import { useTranslations } from '@/shared/components/translationsProvider';
import { useStepper } from '@/shared/hooks/useStepper';
import { daoUtils } from '@/shared/utils/daoUtils';
import { type ISppProposal, SppProposalType } from '../../types';
import { sppReportProposalResultDialogUtils } from './sppReportProposalResultDialogUtils';

export interface ISppReportProposalResultDialogParams {
    /**
     * ID of the DAO to create the proposal for.
     */
    daoId: string;
    /**
     * Proposal to submit the vote for.
     */
    proposal: ISppProposal;
    /**
     * Defines if the vote to approve or veto the proposal.
     */
    isVeto?: boolean;
}

export interface ISppReportProposalResultDialogProps
    extends IDialogComponentProps<ISppReportProposalResultDialogParams> {}

export const SppReportProposalResultDialog: React.FC<
    ISppReportProposalResultDialogProps
> = (props) => {
    const { location } = props;

    const { t } = useTranslations();
    const router = useRouter();

    invariant(
        location.params != null,
        'SppReportProposalResultDialog: required parameters must be set.',
    );

    const { address } = useConnection();
    invariant(
        address != null,
        'SppReportProposalResultDialog: external wallet must be connected.',
    );

    const { proposal, isVeto, daoId } = location.params;

    const stepper = useStepper<
        ITransactionDialogStepMeta,
        TransactionDialogStep
    >({
        initialActiveStep: TransactionDialogStep.PREPARE,
    });

    const { data: dao } = useDao({ urlParams: { id: daoId } });

    const handlePrepareTransaction = () => {
        const resultType = isVeto
            ? SppProposalType.VETO
            : SppProposalType.APPROVAL;

        return sppReportProposalResultDialogUtils.buildTransaction({
            proposal,
            resultType,
        });
    };

    const slug = proposalUtils.getProposalSlug(proposal, dao);
    const confirmationContext = isVeto ? 'veto' : 'approve';

    return (
        <TransactionDialog
            description={t(
                'app.plugins.spp.sppReportProposalResultDialog.description',
            )}
            indexingFallbackUrl={
                slug != null
                    ? daoUtils.getDaoUrl(dao, `proposals/${slug}`)
                    : undefined
            }
            network={proposal.network}
            prepareTransaction={handlePrepareTransaction}
            stepper={stepper}
            submitLabel={t(
                'app.plugins.spp.sppReportProposalResultDialog.button.submit',
            )}
            successLink={{
                label: t(
                    'app.plugins.spp.sppReportProposalResultDialog.button.success',
                ),
                onClick: () => router.refresh(),
            }}
            title={t('app.plugins.spp.sppReportProposalResultDialog.title')}
            transactionType={TransactionType.PROPOSAL_REPORT_RESULTS}
        >
            <VoteProposalDataListItemStructure
                proposalId={slug ?? ''}
                proposalTitle={proposal.title}
                voteIndicator="yes"
                voteIndicatorDescription={t(
                    `app.plugins.spp.sppReportProposalResultDialog.voteDescription.${confirmationContext}`,
                )}
            />
        </TransactionDialog>
    );
};
