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
import { encodeFunctionData, type Hex } from 'viem';
import { dynamicExitQueueAbi } from '../../utils/lockToVoteTransactionUtils/dynamicExitQueueAbi';
import type { ILockToVoteWithdrawTransactionDialogProps } from './lockToVoteWithdrawTransactionDialog.api';

export const LockToVoteWithdrawTransactionDialog: React.FC<ILockToVoteWithdrawTransactionDialogProps> = (props) => {
    const { location } = props;
    invariant(location.params != null, 'LockToVoteWithdrawTransactionDialog: required parameters must be set.');

    const { tokenId, token, lockManagerAddress, network, onSuccess } = location.params;

    const { t } = useTranslations();
    const router = useRouter();

    const initialActiveStep = TransactionDialogStep.PREPARE;
    const stepper = useStepper<ITransactionDialogStepMeta, TransactionDialogStep>({ initialActiveStep });

    const handlePrepareTransaction = async () => {
        // Build exit transaction
        const data = encodeFunctionData({
            abi: dynamicExitQueueAbi,
            functionName: 'exit',
            args: [tokenId],
        });

        return {
            to: lockManagerAddress as Hex,
            data,
            value: BigInt(0),
        };
    };

    return (
        <TransactionDialog
            title={t('app.plugins.lockToVote.withdrawTransactionDialog.title', { symbol: token.symbol })}
            description={t('app.plugins.lockToVote.withdrawTransactionDialog.description', { symbol: token.symbol })}
            submitLabel={t('app.plugins.lockToVote.withdrawTransactionDialog.submit')}
            stepper={stepper}
            prepareTransaction={handlePrepareTransaction}
            network={network}
            onSuccess={onSuccess}
            successLink={{
                label: t('app.plugins.lockToVote.withdrawTransactionDialog.success'),
                onClick: () => router.refresh(),
            }}
        />
    );
};
