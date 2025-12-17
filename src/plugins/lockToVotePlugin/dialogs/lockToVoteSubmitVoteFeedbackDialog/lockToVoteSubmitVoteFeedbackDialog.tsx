'use client';

import { Dialog, EmptyState, invariant } from '@aragon/gov-ui-kit';
import { type IDialogComponentProps, useDialogContext } from '@/shared/components/dialogProvider';
import { useTranslations } from '@/shared/components/translationsProvider';
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
     *  Flag indicating whether the user can vote.
     */
    canVote: boolean;
}

export interface ILockToVoteSubmitVoteFeedbackDialogProps extends IDialogComponentProps<ILockToVoteSubmitVoteFeedbackDialogParams> {}

export const LockToVoteSubmitVoteFeedbackDialog: React.FC<ILockToVoteSubmitVoteFeedbackDialogProps> = (props) => {
    const { location } = props;
    invariant(location.params != null, 'LockToVoteSubmitVoteFeedbackDialog: required parameters must be set.');
    const { plugin, daoId, onVoteClick, canVote } = location.params;

    const { t } = useTranslations();
    const { close, open } = useDialogContext();
    const { lockedAmount } = useLockToVoteData({ plugin, daoId });

    const handleLockTokens = () => {
        const params: ILockToVoteLockBeforeVoteDialogParams = {
            plugin,
            daoId,
            onVoteClick,
        };
        open(LockToVotePluginDialogId.LOCK_BEFORE_VOTE, { params });
    };

    const { symbol: tokenSymbol } = plugin.settings.token;
    const hasVotingPower = lockedAmount > 0;
    const translationVariant = hasVotingPower ? 'lockMore' : 'default';
    const displayVoteButton = hasVotingPower && canVote;

    const primaryAction = {
        label: t('app.plugins.lockToVote.lockToVoteSubmitVoteFeedbackDialog.cta.lock'),
        onClick: handleLockTokens,
    };

    const cancelAction = {
        label: t('app.plugins.lockToVote.lockToVoteSubmitVoteFeedbackDialog.cta.cancel'),
        onClick: () => close(),
    };

    const voteAction = {
        label: t('app.plugins.lockToVote.lockToVoteSubmitVoteFeedbackDialog.cta.vote'),
        onClick: () => onVoteClick(),
    };

    return (
        <Dialog.Content>
            <EmptyState
                description={t(`app.plugins.lockToVote.lockToVoteSubmitVoteFeedbackDialog.${translationVariant}.description`, {
                    symbol: tokenSymbol,
                })}
                heading={t(`app.plugins.lockToVote.lockToVoteSubmitVoteFeedbackDialog.${translationVariant}.title`)}
                objectIllustration={{
                    object: hasVotingPower ? 'WALLET' : 'USERS',
                }}
                primaryButton={primaryAction}
                secondaryButton={displayVoteButton ? voteAction : cancelAction}
            />
        </Dialog.Content>
    );
};
