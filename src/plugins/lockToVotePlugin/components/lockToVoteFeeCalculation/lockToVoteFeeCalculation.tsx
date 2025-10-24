'use client';

import { useTranslations } from '@/shared/components/translationsProvider';
import { formatterUtils, NumberFormat } from '@aragon/gov-ui-kit';
import { formatUnits } from 'viem';
import type { ILockToVoteFeeCalculationProps } from './lockToVoteFeeCalculation.api';

export const LockToVoteFeeCalculation: React.FC<ILockToVoteFeeCalculationProps> = (props) => {
    const { lockedAmount, feeAmount, token } = props;

    const { t } = useTranslations();

    // Calculate net receive amount
    const receiveAmount = lockedAmount - feeAmount;

    // Format amounts
    const formatAmount = (amount: bigint): string => {
        const parsed = formatUnits(amount, token.decimals);
        return formatterUtils.formatNumber(parsed, { format: NumberFormat.TOKEN_AMOUNT_SHORT });
    };

    const formattedLockedAmount = formatAmount(lockedAmount);
    const formattedFeeAmount = formatAmount(feeAmount);
    const formattedReceiveAmount = formatAmount(receiveAmount);

    return (
        <div className="flex flex-col gap-3 rounded-xl border border-neutral-100 p-4 md:p-6">
            {/* Locked tokens row */}
            <div className="flex items-baseline justify-between text-base leading-tight font-normal text-neutral-500">
                <span>{t('app.plugins.lockToVote.feeCalculation.lockedTokens')}</span>
                <span className="text-right">
                    {formattedLockedAmount} {token.symbol}
                </span>
            </div>

            {/* Withdraw fee row */}
            <div className="text-primary-400 flex items-baseline justify-between text-base leading-tight font-normal">
                <span>{t('app.plugins.lockToVote.feeCalculation.withdrawFee')}</span>
                <span className="text-right">
                    - {formattedFeeAmount} {token.symbol}
                </span>
            </div>

            {/* Divider */}
            <div className="h-px w-full bg-neutral-100" />

            {/* Receive now row */}
            <div className="flex items-baseline justify-between text-base leading-tight font-normal text-neutral-800">
                <span>{t('app.plugins.lockToVote.feeCalculation.receiveNow')}</span>
                <span className="text-right">
                    {formattedReceiveAmount} {token.symbol}
                </span>
            </div>
        </div>
    );
};
