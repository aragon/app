'use client';

import type { Network } from '@/shared/api/daoService';
import { useDialogContext, type IDialogComponentProps } from '@/shared/components/dialogProvider';
import { useTranslations } from '@/shared/components/translationsProvider';
import { networkDefinitions } from '@/shared/constants/networkDefinitions';
import { Dialog, EmptyState, invariant } from '@aragon/gov-ui-kit';
import type { Hex } from 'viem';
import { useAccount, useReadContract } from 'wagmi';

export interface ILockToVoteSubmitVoteFeedbackDialogParams {
    /**
     * Address of the lock-to-vote lock manager.
     */
    lockManagerAddress: string;
    /**
     * Network of the plugin.
     */
    network: Network;
    /**
     * Callback called on vote button click.
     */
    onVoteClick: () => void;
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

    const { t } = useTranslations();
    const { address } = useAccount();
    const { close } = useDialogContext();

    const { lockManagerAddress, network, onVoteClick } = location.params;
    const { id: chainId } = networkDefinitions[network];

    const { data: lockedBalance } = useReadContract({
        abi: lockManagerAbi,
        address: lockManagerAddress as Hex,
        chainId,
        functionName: 'getLockedBalance',
        args: [address as Hex],
        query: { enabled: address != null },
    });

    const handleLockTokens = () => {
        // TODO
    };

    const hasUnlockedTokens = lockedBalance != null && lockedBalance > 0;
    const translationVariant = hasUnlockedTokens ? 'lockMore' : 'default';

    const primaryAction = {
        label: t(`app.plugins.lockToVote.lockToVoteSubmitVoteFeedbackDialog.${translationVariant}.cta.primary`),
        onClick: handleLockTokens,
    };

    const secondaryAction = {
        label: t(`app.plugins.lockToVote.lockToVoteSubmitVoteFeedbackDialog.${translationVariant}.cta.secondary`),
        onClick: hasUnlockedTokens ? onVoteClick : () => close(),
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
