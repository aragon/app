import { GovernanceDialogs } from '@/modules/governance/constants/moduleDialogs';
import type { IVoteDialogParams } from '@/modules/governance/dialogs/voteDialog';
import { useVotedStatus } from '@/modules/governance/hooks/useVotedStatus';
import { useDialogContext } from '@/shared/components/dialogProvider';
import { useTranslations } from '@/shared/components/translationsProvider';
import { networkDefinitions } from '@/shared/constants/networkDefinitions';
import { Button, ChainEntityType, IconType, useBlockExplorer } from '@aragon/gov-ui-kit';
import type { IMultisigProposal, IMultisigVote } from '../../types';

export interface IMultisigSubmitVoteProps {
    daoId: string;
    proposal: IMultisigProposal;
    isVeto?: boolean;
}

export const MultisigSubmitVote: React.FC<IMultisigSubmitVoteProps> = ({ daoId, proposal, isVeto }) => {
    const { t } = useTranslations();
    const { open } = useDialogContext();

    const { voteStatus, didVote } = useVotedStatus({ proposal });
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
        <div className="w-full pt-4">
            <Button
                onClick={didVote ? undefined : openTransactionDialog}
                href={didVote ? latestVoteTxHref : undefined}
                target={didVote ? '_blank' : undefined}
                size="md"
                iconLeft={didVote ? IconType.CHECKMARK : undefined}
                variant={didVote ? 'secondary' : 'primary'}
                className="w-full md:w-fit"
            >
                {didVote
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
