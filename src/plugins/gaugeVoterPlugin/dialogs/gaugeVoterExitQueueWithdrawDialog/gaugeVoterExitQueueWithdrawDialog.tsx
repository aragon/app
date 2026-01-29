'use client';

import { Dialog, invariant } from '@aragon/gov-ui-kit';
import { useMemo } from 'react';
import { useDialogContext } from '@/shared/components/dialogProvider';
import { useTranslations } from '@/shared/components/translationsProvider';
import { GaugeVoterExitQueueFeeChart } from '../../components/gaugeVoterExitQueue/gaugeVoterExistQueueFeeChart';
import { GaugeVoterExitQueueFeeCalculation } from '../../components/gaugeVoterExitQueue/gaugeVoterExitQueueFeeCalculation';
import { GaugeVoterPluginDialogId } from '../../constants/gaugeVoterPluginDialogId';
import { GaugeVoterExitQueueFeeMode } from '../../types/enum';
import { gaugeVoterExitQueueFeeUtils } from '../../utils/gaugeVoterExitQueueFeeUtils';
import type { IGaugeVoterExitQueueWithdrawTransactionDialogParams } from '../gaugeVoterExitQueueWithdrawTransactionDialog';
import type { IGaugeVoterExitQueueWithdrawDialogProps } from './gaugeVoterExitQueueWithdrawDialog.api';

export const GaugeVoterExitQueueWithdrawDialog: React.FC<
    IGaugeVoterExitQueueWithdrawDialogProps
> = (props) => {
    const { location } = props;
    invariant(
        location.params != null,
        'GaugeVoterExitQueueWithdrawDialog: required parameters must be set.',
    );

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

    const currentFeePercent = gaugeVoterExitQueueFeeUtils.calculateFeeAtTime({
        timeElapsed,
        ticket,
    });

    const feeAmount = useMemo(() => {
        if (feeAmountFromParams != null) {
            return feeAmountFromParams;
        }

        const feeBasisPoints = Math.round(
            (currentFeePercent * gaugeVoterExitQueueFeeUtils.MAX_FEE_PERCENT) /
                100,
        );
        return (
            (lockedAmount * BigInt(feeBasisPoints)) /
            BigInt(gaugeVoterExitQueueFeeUtils.MAX_FEE_PERCENT)
        );
    }, [currentFeePercent, feeAmountFromParams, lockedAmount]);

    const feeMode = gaugeVoterExitQueueFeeUtils.determineFeeMode(ticket);
    const shouldShowChart = feeMode !== GaugeVoterExitQueueFeeMode.FIXED;

    const handleWithdraw = () => {
        close();

        const txDialogParams: IGaugeVoterExitQueueWithdrawTransactionDialogParams =
            {
                tokenId,
                token,
                escrowAddress,
                network,
                onSuccess,
            };

        open(GaugeVoterPluginDialogId.EXIT_QUEUE_WITHDRAW_TRANSACTION, {
            params: txDialogParams,
        });
    };

    return (
        <>
            <Dialog.Header
                onClose={close}
                title={t(
                    'app.plugins.gaugeVoter.gaugeVoterExitQueue.withdrawDialog.title',
                    {
                        symbol: token.symbol,
                    },
                )}
            />
            <Dialog.Content className="flex flex-col gap-6 pt-4">
                {shouldShowChart && (
                    <GaugeVoterExitQueueFeeChart
                        currentTime={currentTime}
                        ticket={ticket}
                    />
                )}

                <GaugeVoterExitQueueFeeCalculation
                    feeAmount={feeAmount}
                    helpText={
                        shouldShowChart
                            ? t(
                                  'app.plugins.gaugeVoter.gaugeVoterExitQueue.withdrawDialog.helpText',
                              )
                            : undefined
                    }
                    lockedAmount={lockedAmount}
                    token={token}
                />
            </Dialog.Content>
            <Dialog.Footer
                primaryAction={{
                    label: t(
                        'app.plugins.gaugeVoter.gaugeVoterExitQueue.withdrawDialog.submit',
                    ),
                    onClick: handleWithdraw,
                }}
                secondaryAction={{
                    label: t(
                        'app.plugins.gaugeVoter.gaugeVoterExitQueue.withdrawDialog.back',
                    ),
                    onClick: handleBack,
                }}
                variant="wizard"
            />
        </>
    );
};
