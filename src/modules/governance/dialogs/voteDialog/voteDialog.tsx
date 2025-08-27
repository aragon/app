import { type IDaoPlugin, useDao } from '@/shared/api/daoService';
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
import { invariant, type VoteIndicator, VoteProposalDataListItemStructure } from '@aragon/gov-ui-kit';
import { useRouter } from 'next/navigation';
import { useAccount } from 'wagmi';
import type { IProposal } from '../../api/governanceService';
import type { IBuildVoteDataOption } from '../../types';
import { proposalUtils } from '../../utils/proposalUtils';
import { voteDialogUtils } from './voteDialogUtils';

export interface IVoteDialogOption<TOptionValue = number> extends IBuildVoteDataOption<TOptionValue> {
    /**
     * Label of the vote option.
     */
    label: VoteIndicator;
    /**
     * Description of the vote option.
     */
    labelDescription?: string;
}

export interface IVoteDialogParams<
    TOptionValue = number,
    TOption extends IVoteDialogOption<TOptionValue> = IVoteDialogOption<TOptionValue>,
> {
    /**
     * ID of the DAO to create the proposal for.
     */
    daoId: string;
    /**
     * Vote option.
     */
    vote: TOption;
    /**
     * Proposal to submit the vote for.
     */
    proposal: IProposal;
    /**
     * Target of the transaction for the "to" field, defaults to the plugin address of the proposal.
     */
    target?: string;
    /**
     * Defines if the vote to approve or veto the proposal.
     */
    isVeto?: boolean;
    /**
     * Plugin where the proposal has been created.
     */
    plugin: IDaoPlugin;
}

export interface IVoteDialogProps extends IDialogComponentProps<IVoteDialogParams> {}

export const VoteDialog: React.FC<IVoteDialogProps> = (props) => {
    const { location } = props;

    const { t } = useTranslations();
    const router = useRouter();

    invariant(location.params != null, 'VoteDialog: required parameters must be set.');

    const { address } = useAccount();
    invariant(address != null, 'VoteDialog: user must be connected.');

    const { vote, proposal, isVeto, daoId, plugin, target } = location.params;

    const { data: dao } = useDao({ urlParams: { id: daoId } });

    const stepper = useStepper<ITransactionDialogStepMeta, TransactionDialogStep>({
        initialActiveStep: TransactionDialogStep.PREPARE,
    });

    const handlePrepareTransaction = () => voteDialogUtils.buildTransaction({ proposal, vote, target });

    // Fallback to the parent plugin to display the slug of the parent proposal (if exists)
    const pluginAddress = plugin.parentPlugin ?? plugin.address;
    const slug = proposalUtils.getProposalSlug({ ...proposal, pluginAddress }, dao);

    return (
        <TransactionDialog
            title={t('app.governance.voteDialog.title')}
            description={t('app.governance.voteDialog.description')}
            submitLabel={t('app.governance.voteDialog.button.submit')}
            successLink={{ label: t('app.governance.voteDialog.button.success'), onClick: () => router.refresh() }}
            stepper={stepper}
            prepareTransaction={handlePrepareTransaction}
            network={proposal.network}
            transactionType={TransactionType.PROPOSAL_VOTE}
            indexingFallbackUrl={daoUtils.getDaoUrl(dao, `proposals/${slug}`)}
        >
            <VoteProposalDataListItemStructure
                isVeto={isVeto}
                proposalId={slug}
                proposalTitle={proposal.title}
                voteIndicator={vote.label}
                voteIndicatorDescription={vote.labelDescription}
            />
        </TransactionDialog>
    );
};
