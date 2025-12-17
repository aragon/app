'use client';

import { AssetDataListItem, invariant } from '@aragon/gov-ui-kit';
import { useRouter } from 'next/navigation';
import { formatUnits } from 'viem';
import { useAccount } from 'wagmi';
import type { IToken } from '@/modules/finance/api/financeService';
import type { Network } from '@/shared/api/daoService';
import type { IDialogComponentProps } from '@/shared/components/dialogProvider';
import { type ITransactionDialogStepMeta, TransactionDialog, TransactionDialogStep } from '@/shared/components/transactionDialog';
import { useTranslations } from '@/shared/components/translationsProvider';
import { useStepper } from '@/shared/hooks/useStepper';
import { lockToVoteLockUnlockDialogUtils } from './lockToVoteLockUnlockDialogUtils';

export interface ILockToVoteLockUnlockDialogParams {
    /**
     * Action to be performed.
     */
    action: 'lock' | 'unlock';
    /**
     * Token used for locking.
     */
    token: IToken;
    /**
     * Address of the lock manager contract.
     */
    lockManagerAddress: string;
    /**
     * Amount of tokens to be locked / unlocked in WEI format.
     * Used for the UI for both lock/unlock, but only used for the lock transaction.
     */
    amount: bigint;
    /**
     * Network used for the transaction.
     */
    network: Network;
    /**
     * Callback called on lock / unlock transaction success.
     */
    onSuccess?: () => void;
    /**
     * Flag indicating whether to show the transaction info step in the dialog. Only shown when part of a two step transaction.
     */
    showTransactionInfo: boolean;
}

export interface ILockToVoteLockUnlockDialogProps extends IDialogComponentProps<ILockToVoteLockUnlockDialogParams> {}

export const LockToVoteLockUnlockDialog: React.FC<ILockToVoteLockUnlockDialogProps> = (props) => {
    const { location } = props;
    invariant(location.params != null, 'LockToVoteLockUnlockDialog: required parameters must be set.');

    const { address } = useAccount();
    invariant(address != null, 'LockToVoteLockUnlockDialog: user must be connected to perform the action');

    const { action, token, lockManagerAddress, amount, network, onSuccess, showTransactionInfo } = location.params;

    const { t } = useTranslations();
    const router = useRouter();

    const initialActiveStep = TransactionDialogStep.PREPARE;
    const stepper = useStepper<ITransactionDialogStepMeta, TransactionDialogStep>({ initialActiveStep });

    const handlePrepareTransaction = () =>
        action === 'lock'
            ? lockToVoteLockUnlockDialogUtils.buildLockTransaction(amount, lockManagerAddress)
            : lockToVoteLockUnlockDialogUtils.buildUnlockTransaction(lockManagerAddress);

    const parsedAmount = formatUnits(amount, token.decimals);

    const transactionInfo = showTransactionInfo
        ? {
              title: t(`app.plugins.lockToVote.lockToVoteLockUnlockDialog.${action}.transactionInfoTitle`, {
                  symbol: token.symbol,
              }),
              current: 2,
              total: 2,
          }
        : undefined;

    return (
        <TransactionDialog
            description={t(`app.plugins.lockToVote.lockToVoteLockUnlockDialog.${action}.description`)}
            network={network}
            onSuccess={onSuccess}
            prepareTransaction={handlePrepareTransaction}
            stepper={stepper}
            submitLabel={t(`app.plugins.lockToVote.lockToVoteLockUnlockDialog.${action}.submit`)}
            successLink={{
                label: t(`app.plugins.lockToVote.lockToVoteLockUnlockDialog.${action}.success`),
                onClick: () => router.refresh(),
            }}
            title={t(`app.plugins.lockToVote.lockToVoteLockUnlockDialog.${action}.title`)}
            transactionInfo={transactionInfo}
        >
            <AssetDataListItem.Structure
                amount={parsedAmount}
                hideValue={true}
                logoSrc={token.logo}
                name={token.name}
                symbol={token.symbol}
            />
        </TransactionDialog>
    );
};
