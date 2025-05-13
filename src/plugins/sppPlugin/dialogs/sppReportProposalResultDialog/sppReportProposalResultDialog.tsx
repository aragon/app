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
import { useDaoPlugins } from '@/shared/hooks/useDaoPlugins';
import { useStepper } from '@/shared/hooks/useStepper';
import { daoUtils } from '@/shared/utils/daoUtils';
import { invariant, VoteProposalDataListItemStructure } from '@aragon/gov-ui-kit';
import { useRouter } from 'next/navigation';
import { useAccount } from 'wagmi';
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

export const SppReportProposalResultDialog: React.FC<ISppReportProposalResultDialogProps> = (props) => {
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

    const { data: dao } = useDao({ urlParams: { id: daoId } });

    const handlePrepareTransaction = () =>
        sppReportProposalResultDialogUtils.buildTransaction({
            proposal,
            resultType: isVeto ? SppProposalType.VETO : SppProposalType.APPROVAL,
        });

    const pluginAddress = proposal.pluginAddress;
    const processedPlugin = useDaoPlugins({ daoId, pluginAddress, includeSubPlugins: true })?.[0];

    const slug = proposalUtils.getProposalSlug(proposal.incrementalId, processedPlugin?.meta);
    const confirmationContext = isVeto ? 'veto' : 'approve';

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
            indexingFallbackUrl={daoUtils.getDaoUrl(dao, `proposals/${slug}`)}
        >
            <VoteProposalDataListItemStructure
                proposalId={slug}
                proposalTitle={proposal.title}
                voteIndicator="yes"
                confirmationLabel={t(
                    `app.plugins.spp.sppReportProposalResultDialog.confirmationLabel.${confirmationContext}`,
                )}
            />
        </TransactionDialog>
    );
};
