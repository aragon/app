import { GovernanceDialogId } from '@/modules/governance/constants/governanceDialogId';
import type { IVoteDialogParams } from '@/modules/governance/dialogs/voteDialog';
import { useDialogContext } from '@/shared/components/dialogProvider';
import { useTranslations } from '@/shared/components/translationsProvider';
import { useDaoPlugins } from '@/shared/hooks/useDaoPlugins';
import { Button, IconType } from '@aragon/gov-ui-kit';
import type { ISppProposal } from '../../types';

export interface ISppVotingTerminalBodyVoteDefaultProps {
    /**
     * ID of the DAO to create the proposal for.
     */
    daoId: string;
    /**
     * Proposal to submit the vote for.
     */
    proposal: ISppProposal;
    /**
     *  Defines if the vote is to approve or veto the proposal.
     */
    isVeto: boolean;
}

export const SppVotingTerminalBodyVoteDefault: React.FC<ISppVotingTerminalBodyVoteDefaultProps> = (props) => {
    const { daoId, proposal, isVeto } = props;
    const { pluginAddress } = proposal;

    const { t } = useTranslations();
    const { open } = useDialogContext();

    const voted = false;

    const openTransactionDialog = () => {
        const vote = { label: 'approve' as const };
        const params: IVoteDialogParams = { daoId, proposal, vote, isVeto, plugin };
        open(GovernanceDialogId.VOTE, { params });
    };

    const voteLabel = voted ? (isVeto ? 'vetoed' : 'approved') : isVeto ? 'veto' : 'approve';

    const { meta: plugin } = useDaoPlugins({ daoId, pluginAddress, includeSubPlugins: true })![0];

    const handleVoteClick = () => openTransactionDialog();

    return (
        <div className="flex w-full flex-col gap-3">
            <Button
                onClick={voted ? undefined : handleVoteClick}
                size="md"
                iconLeft={voted ? IconType.CHECKMARK : undefined}
                variant={voted ? 'secondary' : 'primary'}
                className="w-full md:w-fit"
            >
                {t(`app.plugins.spp.sppVotingTerminalBodyVoteDefault.${voteLabel}`)}
            </Button>
            {!voted && (
                <p className="text-center text-sm font-normal leading-normal text-neutral-500 md:text-left">
                    {t('app.plugins.spp.sppVotingTerminalBodyVoteDefault.helpText')}
                </p>
            )}
        </div>
    );
};
