import { GovernanceDialogs } from '@/modules/governance/constants/moduleDialogs';
import type { IVoteDialogParams } from '@/modules/governance/dialogs/voteDialog';
import { useVotedStatus } from '@/modules/governance/hooks/useVotedStatus';
import { useDialogContext } from '@/shared/components/dialogProvider';
import { useTranslations } from '@/shared/components/translationsProvider';
import { networkDefinitions } from '@/shared/constants/networkDefinitions';
import { Button, ChainEntityType, IconType, useBlockExplorer } from '@aragon/gov-ui-kit';
import type { IMultisigProposal, IMultisigVote } from '../../types';

export interface IMultisigSubmitVoteProps {
    /**
     * ID of the DAO to create the proposal for.
     */
    daoId: string;
    /**
     * Proposal to submit the vote for.
     */
    proposal: IMultisigProposal;
    /**
     *  Defines if the vote to approve or veto the proposal.
     */
    isVeto?: boolean;
}

export const MultisigSubmitVote: React.FC<IMultisigSubmitVoteProps> = (props) => {
    const { daoId, proposal, isVeto } = props;

    const { t } = useTranslations();
    const { open } = useDialogContext();

    const openTransactionDialog = () => {
        const params: IVoteDialogParams = { daoId, proposal, vote: { label: 'approve' }, isVeto };
        open(GovernanceDialogs.VOTE, { params });
    };
    const { voteStatus, didVote } = useVotedStatus({ proposal });
    const latestVote = voteStatus?.pages[0].data[0] as IMultisigVote | undefined;
    const { transactionHash } = latestVote ?? {};

    const latestVoteTx = transactionHash;
    const chainId = networkDefinitions[proposal.network].chainId;
    const { buildEntityUrl } = useBlockExplorer({ chainId });
    const latestVoteTxHref = buildEntityUrl({
        type: ChainEntityType.TRANSACTION,
        id: latestVoteTx ?? '',
    });

    return (
        <div className="w-full pt-4">
            {didVote ? (
                <Button
                    href={latestVoteTxHref}
                    target="_blank"
                    size="md"
                    iconLeft={IconType.CHECKMARK}
                    variant="secondary"
                    className="w-full md:w-fit"
                >
                    {isVeto
                        ? t('app.plugins.multisig.multisigSubmitVote.vetoedLabel')
                        : t('app.plugins.multisig.multisigSubmitVote.approvedLabel')}
                </Button>
            ) : (
                <Button onClick={openTransactionDialog} size="md" variant="primary" className="w-full md:w-fit">
                    {isVeto
                        ? t('app.plugins.multisig.multisigSubmitVote.vetoLabel')
                        : t('app.plugins.multisig.multisigSubmitVote.approveLabel')}
                </Button>
            )}
        </div>
    );
};
