'use client';

import { useDialogContext, type IDialogComponentProps } from '@/shared/components/dialogProvider';
import { useTranslations } from '@/shared/components/translationsProvider';
import { Dialog, EmptyState, invariant } from '@aragon/gov-ui-kit';
import { LockToVotePluginDialogId } from '../../constants/lockToVotePluginDialogId';
import { useLockToVoteData } from '../../hooks/useLockToVoteData';
import type { ILockToVotePlugin } from '../../types';
import type { ILockToVoteLockBeforeVoteDialogParams } from '../lockToVoteLockBeforeVoteDialog';

export interface ILockToVoteSubmitVoteFeedbackDialogParams {
    /**
     * Lock to vote plugin.
     */
    plugin: ILockToVotePlugin;
    /**
     * ID of the DAO.
     */
    daoId: string;
    /**
     * Callback called on vote button click.
     */
    onVoteClick: (lockAmount?: bigint) => void;
    /**
     * Defines if the submit-vote feedback is displayed for a proposal with vote replacement enabled or not.
     */
    isVoteReplacement?: boolean;
}

export interface ILockToVoteSubmitVoteFeedbackDialogProps
    extends IDialogComponentProps<ILockToVoteSubmitVoteFeedbackDialogParams> {}

export const LockToVoteSubmitVoteFeedbackDialog: React.FC<ILockToVoteSubmitVoteFeedbackDialogProps> = (props) => {
    const { location } = props;
    invariant(location.params != null, 'LockToVoteSubmitVoteFeedbackDialog: required parameters must be set.');
    const { plugin, daoId, onVoteClick, isVoteReplacement } = location.params;

    const { t } = useTranslations();
    const { close, open } = useDialogContext();
    const { lockedAmount } = useLockToVoteData({ plugin, daoId });

    const handleLockTokens = () => {
        const params: ILockToVoteLockBeforeVoteDialogParams = { plugin, daoId, onVoteClick };
        open(LockToVotePluginDialogId.LOCK_BEFORE_VOTE, { params });
    };

    const { symbol: tokenSymbol } = plugin.settings.token;
    const hasVotingPower = lockedAmount > 0;

    const translationVariant = hasVotingPower ? 'lockMore' : 'default';
    const displayVoteButton = hasVotingPower && isVoteReplacement;

    const primaryAction = {
        label: t(`app.plugins.lockToVote.lockToVoteSubmitVoteFeedbackDialog.cta.lock`),
        onClick: handleLockTokens,
    };

    const cancelAction = {
        label: t(`app.plugins.lockToVote.lockToVoteSubmitVoteFeedbackDialog.cta.cancel`),
        onClick: () => close(),
    };

    const voteAction = {
        label: t(`app.plugins.lockToVote.lockToVoteSubmitVoteFeedbackDialog.cta.vote`),
        onClick: () => onVoteClick(),
    };

    return (
        <Dialog.Content>
            <EmptyState
                heading={t(`app.plugins.lockToVote.lockToVoteSubmitVoteFeedbackDialog.${translationVariant}.title`)}
                description={t(
                    `app.plugins.lockToVote.lockToVoteSubmitVoteFeedbackDialog.${translationVariant}.description`,
                    { symbol: tokenSymbol },
                )}
                objectIllustration={{ object: hasVotingPower ? 'WALLET' : 'USERS' }}
                primaryButton={primaryAction}
                secondaryButton={displayVoteButton ? voteAction : cancelAction}
            />
        </Dialog.Content>
    );
};
