'use client';

import type { Network } from '@/shared/api/daoService';
import { useDialogContext, type IDialogComponentProps } from '@/shared/components/dialogProvider';
import { useTranslations } from '@/shared/components/translationsProvider';
import { networkDefinitions } from '@/shared/constants/networkDefinitions';
import { Dialog, EmptyState, invariant } from '@aragon/gov-ui-kit';
import type { Hex } from 'viem';
import { useAccount, useReadContract } from 'wagmi';
import { LockToVotePluginDialogId } from '../../constants/lockToVotePluginDialogId';
import type { ILockToVotePlugin } from '../../types';
import type { ILockToVoteLockTokensDialogParams } from '../lockToVoteLockTokensDialog';

export interface ILockToVoteSubmitVoteFeedbackDialogParams {
    /**
     * Lock to vote plugin.
     */
    plugin: ILockToVotePlugin;
    /**
     * Network of the plugin.
     */
    network: Network;
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

const lockManagerAbi = [
    {
        type: 'function',
        inputs: [{ name: '_account', type: 'address' }],
        name: 'getLockedBalance',
        outputs: [{ name: '', type: 'uint256' }],
        stateMutability: 'view',
    },
] as const;

export const LockToVoteSubmitVoteFeedbackDialog: React.FC<ILockToVoteSubmitVoteFeedbackDialogProps> = (props) => {
    const { location } = props;
    invariant(location.params != null, 'TokenApproveNftDialog: required parameters must be set.');
    const { plugin, network, daoId, onVoteClick } = location.params;

    const { t } = useTranslations();
    const { address } = useAccount();
    const { close, open } = useDialogContext();

    const { id: chainId } = networkDefinitions[network];

    const { data: lockedBalance } = useReadContract({
        abi: lockManagerAbi,
        address: plugin.lockManagerAddress as Hex,
        chainId,
        functionName: 'getLockedBalance',
        args: [address as Hex],
        query: { enabled: address != null },
    });

    const handleLockTokens = () => {
        const params: ILockToVoteLockTokensDialogParams = { plugin, daoId, onVoteClick };
        open(LockToVotePluginDialogId.LOCK_TOKENS, { params });
    };

    const hasUnlockedTokens = lockedBalance != null && lockedBalance > 0;
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
