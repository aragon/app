'use client';

import { Dialog, invariant } from '@aragon/gov-ui-kit';
import { useMemo } from 'react';
import { useDialogContext } from '@/shared/components/dialogProvider';
import { useTranslations } from '@/shared/components/translationsProvider';
import { TokenExitQueueFeeChart } from '../../components/tokenExitQueue/tokenExistQueueFeeChart';
import { TokenExitQueueFeeCalculation } from '../../components/tokenExitQueue/tokenExitQueueFeeCalculation';
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
        escrowAddress,
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

    const currentTime = Math.floor(Date.now() / 1000);
    const timeElapsed = currentTime - ticket.queuedAt;

    const currentFeePercent = tokenExitQueueFeeUtils.calculateFeeAtTime({
        timeElapsed,
        ticket,
    });

    const feeAmount = useMemo(() => {
        if (feeAmountFromParams != null) {
            return feeAmountFromParams;
        }

        const feeBasisPoints = Math.round((currentFeePercent * tokenExitQueueFeeUtils.MAX_FEE_PERCENT) / 100);
        return (lockedAmount * BigInt(feeBasisPoints)) / BigInt(tokenExitQueueFeeUtils.MAX_FEE_PERCENT);
    }, [currentFeePercent, feeAmountFromParams, lockedAmount]);

    const feeMode = tokenExitQueueFeeUtils.determineFeeMode(ticket);
    const shouldShowChart = feeMode !== TokenExitQueueFeeMode.FIXED;

    const handleWithdraw = () => {
        close();

        const txDialogParams: ITokenExitQueueWithdrawTransactionDialogParams = {
            tokenId,
            token,
            escrowAddress,
            network,
            onSuccess,
        };

        open(TokenPluginDialogId.EXIT_QUEUE_WITHDRAW_TRANSACTION, {
            params: txDialogParams,
        });
    };

    return (
        <>
            <Dialog.Header
                onClose={close}
                title={t('app.plugins.tokenExitQueue.withdrawDialog.title', {
                    symbol: token.symbol,
                })}
            />
            <Dialog.Content className="flex flex-col gap-6 pt-4">
                {shouldShowChart && <TokenExitQueueFeeChart currentTime={currentTime} ticket={ticket} />}

                <TokenExitQueueFeeCalculation
                    feeAmount={feeAmount}
                    helpText={shouldShowChart ? t('app.plugins.tokenExitQueue.withdrawDialog.helpText') : undefined}
                    lockedAmount={lockedAmount}
                    token={token}
                />
            </Dialog.Content>
            <Dialog.Footer
                primaryAction={{
                    label: t('app.plugins.tokenExitQueue.withdrawDialog.submit'),
                    onClick: handleWithdraw,
                }}
                secondaryAction={{
                    label: t('app.plugins.tokenExitQueue.withdrawDialog.back'),
                    onClick: handleBack,
                }}
                variant="wizard"
            />
        </>
    );
};
