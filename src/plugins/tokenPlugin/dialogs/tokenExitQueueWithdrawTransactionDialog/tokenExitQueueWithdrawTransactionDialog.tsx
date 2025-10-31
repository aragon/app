'use client';

import {
    TransactionDialog,
    TransactionDialogStep,
    type ITransactionDialogStepMeta,
} from '@/shared/components/transactionDialog';
import { useTranslations } from '@/shared/components/translationsProvider';
import { useStepper } from '@/shared/hooks/useStepper';
import { invariant } from '@aragon/gov-ui-kit';
import { useRouter } from 'next/navigation';
import { encodeFunctionData } from 'viem';
import { dynamicExitQueueAbi } from '../../utils/tokenExitQueueTransactionUtils/dynamicExitQueueAbi';
import type { ITokenExitQueueWithdrawTransactionDialogProps } from './tokenExitQueueWithdrawTransactionDialog.api';

export const TokenExitQueueWithdrawTransactionDialog: React.FC<ITokenExitQueueWithdrawTransactionDialogProps> = (
    props,
) => {
    const { location } = props;
    invariant(location.params != null, 'TokenExitQueueWithdrawTransactionDialog: required parameters must be set.');

    const { tokenId, token, lockManagerAddress, network, onSuccess } = location.params;

    const { t } = useTranslations();
    const router = useRouter();

    const initialActiveStep = TransactionDialogStep.PREPARE;
    const stepper = useStepper<ITransactionDialogStepMeta, TransactionDialogStep>({ initialActiveStep });

    const handlePrepareTransaction = () => {
        const data = encodeFunctionData({
            abi: dynamicExitQueueAbi,
            functionName: 'exit',
            args: [tokenId],
        });

        return Promise.resolve({
            to: lockManagerAddress,
            data,
            value: BigInt(0),
        });
    };

    return (
        <TransactionDialog
            title={t('app.plugins.tokenExitQueue.withdrawTransactionDialog.title', { symbol: token.symbol })}
            description={t('app.plugins.tokenExitQueue.withdrawTransactionDialog.description', {
                symbol: token.symbol,
            })}
            submitLabel={t('app.plugins.tokenExitQueue.withdrawTransactionDialog.submit')}
            stepper={stepper}
            prepareTransaction={handlePrepareTransaction}
            network={network}
            onSuccess={onSuccess}
            successLink={{
                label: t('app.plugins.tokenExitQueue.withdrawTransactionDialog.success'),
                onClick: () => router.refresh(),
            }}
        />
    );
};
