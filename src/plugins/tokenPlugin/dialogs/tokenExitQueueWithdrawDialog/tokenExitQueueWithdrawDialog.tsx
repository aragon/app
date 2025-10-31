'use client';

import { useDialogContext } from '@/shared/components/dialogProvider';
import { useTranslations } from '@/shared/components/translationsProvider';
import { Dialog, invariant } from '@aragon/gov-ui-kit';
import { useMemo } from 'react';
import { TokenExitQueueFeeCalculation } from '../../components/tokenExitQueue/feeCalculation';
import { TokenExitQueueFeeChart } from '../../components/tokenExitQueue/feeChart';
import { TokenPluginDialogId } from '../../constants/tokenPluginDialogId';
import { TokenExitQueueFeeMode } from '../../types';
import { tokenExitQueueFeeUtils } from '../../utils/tokenExitQueueFeeUtils';
import type { ITokenExitQueueWithdrawTransactionDialogParams } from '../tokenExitQueueWithdrawTransactionDialog';
import type { ITokenExitQueueWithdrawDialogProps } from './tokenExitQueueWithdrawDialog.api';

export const TokenExitQueueWithdrawDialog: React.FC<ITokenExitQueueWithdrawDialogProps> = (props) => {
    const { location } = props;
    invariant(location.params != null, 'TokenExitQueueWithdrawDialog: required parameters must be set.');

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

    const currentFeePercent = tokenExitQueueFeeUtils.calculateFeeAtTime({
        timeElapsed,
        ticket,
    });

    // Calculate fee amount in wei
    const feeAmount = useMemo(() => {
        if (feeAmountFromParams != null) {
            return feeAmountFromParams;
        }

        const feeBasisPoints = Math.round((currentFeePercent * tokenExitQueueFeeUtils.MAX_FEE_PERCENT) / 100);
        return (lockedAmount * BigInt(feeBasisPoints)) / BigInt(tokenExitQueueFeeUtils.MAX_FEE_PERCENT);
    }, [currentFeePercent, feeAmountFromParams, lockedAmount]);

    // Determine if chart should be shown
    const feeMode = tokenExitQueueFeeUtils.determineFeeMode(ticket);
    const shouldShowChart = feeMode !== TokenExitQueueFeeMode.FIXED;

    const handleWithdraw = () => {
        close();

        const txDialogParams: ITokenExitQueueWithdrawTransactionDialogParams = {
            tokenId,
            token,
            lockManagerAddress,
            network,
            onSuccess,
        };

        open(TokenPluginDialogId.EXIT_QUEUE_WITHDRAW_TRANSACTION, { params: txDialogParams });
    };

    return (
        <>
            <Dialog.Header
                title={t('app.plugins.tokenExitQueue.withdrawDialog.title', { symbol: token.symbol })}
                onClose={close}
            />
            <Dialog.Content className="flex flex-col gap-6 pt-4">
                {shouldShowChart && <TokenExitQueueFeeChart ticket={ticket} currentTime={currentTime} />}

                <TokenExitQueueFeeCalculation lockedAmount={lockedAmount} feeAmount={feeAmount} token={token} />

                <p className="text-center text-sm leading-normal font-normal text-neutral-500">
                    {t('app.plugins.tokenExitQueue.withdrawDialog.helpText')}
                </p>
            </Dialog.Content>
            <Dialog.Footer
                variant="wizard"
                secondaryAction={{ label: t('app.plugins.tokenExitQueue.withdrawDialog.back'), onClick: handleBack }}
                primaryAction={{
                    label: t('app.plugins.tokenExitQueue.withdrawDialog.submit'),
                    onClick: handleWithdraw,
                }}
            />
        </>
    );
};
