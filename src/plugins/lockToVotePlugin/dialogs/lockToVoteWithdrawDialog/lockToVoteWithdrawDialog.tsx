'use client';

import { useDialogContext } from '@/shared/components/dialogProvider';
import { useTranslations } from '@/shared/components/translationsProvider';
import { Dialog, invariant } from '@aragon/gov-ui-kit';
import classNames from 'classnames';
import { useMemo } from 'react';
import { LockToVoteFeeCalculation } from '../../components/lockToVoteFeeCalculation';
import { LockToVoteFeeChart } from '../../components/lockToVoteFeeChart';
import { LockToVotePluginDialogId } from '../../constants/lockToVotePluginDialogId';
import { LockToVoteFeeMode } from '../../types';
import { lockToVoteFeeUtils } from '../../utils/lockToVoteFeeUtils';
import type { ILockToVoteWithdrawTransactionDialogParams } from '../lockToVoteWithdrawTransactionDialog';
import type { ILockToVoteWithdrawDialogProps } from './lockToVoteWithdrawDialog.api';

export const LockToVoteWithdrawDialog: React.FC<ILockToVoteWithdrawDialogProps> = (props) => {
    const { location } = props;
    invariant(location.params != null, 'LockToVoteWithdrawDialog: required parameters must be set.');

    const {
        tokenId,
        token,
        lockManagerAddress,
        ticket,
        lockedAmount,
        feeAmount: feeAmountFromParams,
        network,
        onBack,
        onSuccess,
    } = location.params;

    const { t } = useTranslations();
    const { open, close } = useDialogContext();

    const handleBack = () => {
        close();
        onBack?.();
    };

    // Calculate current time and fee
    const currentTime = Math.floor(Date.now() / 1000);
    const timeElapsed = currentTime - ticket.queuedAt;

    const currentFeePercent = lockToVoteFeeUtils.calculateFeeAtTime({
        timeElapsed,
        ticket,
    });

    // Calculate fee amount in wei
    const feeAmount = useMemo(() => {
        if (feeAmountFromParams != null) {
            return feeAmountFromParams;
        }

        const feeBasisPoints = Math.round((currentFeePercent * lockToVoteFeeUtils.MAX_FEE_PERCENT) / 100);
        return (lockedAmount * BigInt(feeBasisPoints)) / BigInt(lockToVoteFeeUtils.MAX_FEE_PERCENT);
    }, [currentFeePercent, feeAmountFromParams, lockedAmount]);

    // Determine if chart should be shown
    const feeMode = lockToVoteFeeUtils.determineFeeMode(ticket);
    const shouldShowChart = feeMode !== LockToVoteFeeMode.FIXED;

    const handleWithdraw = () => {
        close();

        const txDialogParams: ILockToVoteWithdrawTransactionDialogParams = {
            tokenId,
            token,
            lockManagerAddress,
            network,
            onSuccess,
        };

        open(LockToVotePluginDialogId.WITHDRAW_TRANSACTION, { params: txDialogParams });
    };

    return (
        <>
            <Dialog.Header
                title={t('app.plugins.lockToVote.withdrawDialog.title', { symbol: token.symbol })}
                onClose={close}
            />
            <Dialog.Content className={classNames({ 'pt-4': !shouldShowChart }, 'flex flex-col gap-6')}>
                {shouldShowChart && <LockToVoteFeeChart ticket={ticket} currentTime={currentTime} />}

                <LockToVoteFeeCalculation lockedAmount={lockedAmount} feeAmount={feeAmount} token={token} />

                <p className="text-center text-sm leading-normal font-normal text-neutral-500">
                    {t('app.plugins.lockToVote.withdrawDialog.helpText')}
                </p>
            </Dialog.Content>
            <Dialog.Footer
                variant="wizard"
                secondaryAction={{ label: t('app.plugins.lockToVote.withdrawDialog.back'), onClick: handleBack }}
                primaryAction={{ label: t('app.plugins.lockToVote.withdrawDialog.submit'), onClick: handleWithdraw }}
            />
        </>
    );
};
