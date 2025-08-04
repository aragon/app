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
}

export interface ILockToVoteSubmitVoteFeedbackDialogProps
    extends IDialogComponentProps<ILockToVoteSubmitVoteFeedbackDialogParams> {}

export const LockToVoteSubmitVoteFeedbackDialog: React.FC<ILockToVoteSubmitVoteFeedbackDialogProps> = (props) => {
    const { location } = props;
    invariant(location.params != null, 'TokenApproveNftDialog: required parameters must be set.');
    const { plugin, daoId, onVoteClick } = location.params;

    const { t } = useTranslations();
    const { close, open } = useDialogContext();
    const { lockedAmount } = useLockToVoteData({ plugin, daoId });

    const handleLockTokens = () => {
        const params: ILockToVoteLockBeforeVoteDialogParams = { plugin, daoId, onVoteClick };
        open(LockToVotePluginDialogId.LOCK_BEFORE_VOTE, { params });
    };

    const hasUnlockedTokens = lockedAmount > 0;
    const translationVariant = hasUnlockedTokens ? 'lockMore' : 'default';

    const primaryAction = {
        label: t(`app.plugins.lockToVote.lockToVoteSubmitVoteFeedbackDialog.${translationVariant}.cta.primary`),
        onClick: handleLockTokens,
    };

    const secondaryAction = {
        label: t(`app.plugins.lockToVote.lockToVoteSubmitVoteFeedbackDialog.${translationVariant}.cta.secondary`),
        onClick: hasUnlockedTokens ? () => onVoteClick() : () => close(),
    };

    return (
        <Dialog.Content>
            <EmptyState
                heading={t(`app.plugins.lockToVote.lockToVoteSubmitVoteFeedbackDialog.${translationVariant}.title`)}
                description={t(
                    `app.plugins.lockToVote.lockToVoteSubmitVoteFeedbackDialog.${translationVariant}.description`,
                )}
                objectIllustration={{ object: hasUnlockedTokens ? 'WALLET' : 'USERS' }}
                primaryButton={primaryAction}
                secondaryButton={secondaryAction}
            />
        </Dialog.Content>
    );
};
