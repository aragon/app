import { GovernanceDialogs } from '@/modules/governance/constants/moduleDialogs';
import type { IVoteDialogParams } from '@/modules/governance/dialogs/voteDialog';
import { useVotedStatus } from '@/modules/governance/hooks/useVotedStatus';
import { useDialogContext } from '@/shared/components/dialogProvider';
import { useTranslations } from '@/shared/components/translationsProvider';
import { networkDefinitions } from '@/shared/constants/networkDefinitions';
import { Button, ChainEntityType, IconType, useBlockExplorer } from '@aragon/gov-ui-kit';
import classNames from 'classnames';
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
     *  Defines if the vote is to approve or veto the proposal.
     */
    isVeto?: boolean;
}

export const MultisigSubmitVote: React.FC<IMultisigSubmitVoteProps> = (props) => {
    const { daoId, proposal, isVeto } = props;

    const { t } = useTranslations();
    const { open } = useDialogContext();

    const { voteStatus, voted, isFetchingVote } = useVotedStatus({ proposal });
    const latestVote = voteStatus?.pages[0].data[0] as IMultisigVote;
    const { transactionHash } = latestVote ?? {};

    const chainId = networkDefinitions[proposal.network].chainId;
    const { buildEntityUrl } = useBlockExplorer({ chainId });
    const latestVoteTxHref = buildEntityUrl({
        type: ChainEntityType.TRANSACTION,
        id: transactionHash,
    });

    const openTransactionDialog = () => {
        const params: IVoteDialogParams = { daoId, proposal, vote: { label: 'approve' }, isVeto };
        open(GovernanceDialogs.VOTE, { params });
    };

    return (
        <div className={classNames('w-full', { 'pt-4': !isFetchingVote })}>
            <Button
                onClick={voted ? undefined : openTransactionDialog}
                href={voted ? latestVoteTxHref : undefined}
                target={voted ? '_blank' : undefined}
                size="md"
                iconLeft={voted ? IconType.CHECKMARK : undefined}
                variant={voted ? 'secondary' : 'primary'}
                className="w-full md:w-fit"
            >
                {voted
                    ? isVeto
                        ? t('app.plugins.multisig.multisigSubmitVote.vetoedLabel')
                        : t('app.plugins.multisig.multisigSubmitVote.approvedLabel')
                    : isVeto
                      ? t('app.plugins.multisig.multisigSubmitVote.vetoLabel')
                      : t('app.plugins.multisig.multisigSubmitVote.approveLabel')}
            </Button>
        </div>
    );
};
