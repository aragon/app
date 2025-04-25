import { TransactionType } from '@/shared/api/transactionService';
import type { IDialogComponentProps } from '@/shared/components/dialogProvider';
import {
    type ITransactionDialogStepMeta,
    TransactionDialog,
    TransactionDialogStep,
} from '@/shared/components/transactionDialog';
import { useTranslations } from '@/shared/components/translationsProvider';
import { useDaoPlugins } from '@/shared/hooks/useDaoPlugins';
import { useStepper } from '@/shared/hooks/useStepper';
import { invariant, VoteProposalDataListItemStructure } from '@aragon/gov-ui-kit';
import { useRouter } from 'next/navigation';
import { useAccount } from 'wagmi';
import { proposalUtils } from '../../../../modules/governance/utils/proposalUtils';
import { type ISppProposal, SppProposalType } from '../../types';
import { reportProposalResultDialogUtils } from './reportProposalResultDialogUtils';

export interface IReportProposalResultDialogParams {
    /**
     * ID of the DAO to create the proposal for.
     */
    daoId: string;
    /**
     * Proposal to submit the vote for.
     */
    proposal: ISppProposal;
    /**
     *  Defines if the vote to approve or veto the proposal.
     */
    isVeto?: boolean;
}

export interface IReportProposalResultDialogProps extends IDialogComponentProps<IReportProposalResultDialogParams> {}

export const ReportProposalResultDialog: React.FC<IReportProposalResultDialogProps> = (props) => {
    const { location } = props;

    const { t } = useTranslations();
    const router = useRouter();

    invariant(location.params != null, 'SppReportProposalResultDialog: required parameters must be set.');

    const { address } = useAccount();
    invariant(address != null, 'SppReportProposalResultDialog: external wallet must be connected.');

    const { proposal, isVeto, daoId } = location.params;

    const stepper = useStepper<ITransactionDialogStepMeta, TransactionDialogStep>({
        initialActiveStep: TransactionDialogStep.PREPARE,
    });

    const handlePrepareTransaction = () =>
        reportProposalResultDialogUtils.buildTransaction({
            proposal,
            resultType: isVeto ? SppProposalType.VETO : SppProposalType.APPROVAL,
        });

    const pluginAddress = proposal.pluginAddress;
    const processedPlugin = useDaoPlugins({ daoId, pluginAddress, includeSubPlugins: true })?.[0];

    const slug = proposalUtils.getProposalSlug(proposal.incrementalId, processedPlugin?.meta);

    return (
        <TransactionDialog
            title={t('app.plugins.spp.sppReportProposalResultDialog.title')}
            description={t('app.plugins.spp.sppReportProposalResultDialog.description')}
            submitLabel={t('app.plugins.spp.sppReportProposalResultDialog.button.submit')}
            successLink={{
                label: t('app.plugins.spp.sppReportProposalResultDialog.button.success'),
                onClick: () => router.refresh(),
            }}
            stepper={stepper}
            prepareTransaction={handlePrepareTransaction}
            network={proposal.network}
            transactionType={TransactionType.PROPOSAL_REPORT_RESULTS}
            indexingFallbackUrl={`/dao/${daoId}/proposals/${slug}`}
        >
            <VoteProposalDataListItemStructure
                proposalId={slug}
                proposalTitle={proposal.title}
                voteIndicator="yes"
                confirmationLabel={
                    isVeto
                        ? t('app.plugins.spp.sppReportProposalResultDialog.confirmationLabelVeto')
                        : t('app.plugins.spp.sppReportProposalResultDialog.confirmationLabelApprove')
                }
            />
        </TransactionDialog>
    );
};
