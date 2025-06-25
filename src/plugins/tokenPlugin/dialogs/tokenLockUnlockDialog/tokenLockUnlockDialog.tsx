'use client';

import type { ITokenPluginSettingsToken } from '@/plugins/tokenPlugin/types';
import type { IDao } from '@/shared/api/daoService';
import { TransactionType } from '@/shared/api/transactionService';
import type { IDialogComponentProps } from '@/shared/components/dialogProvider';
import {
    type ITransactionDialogStepMeta,
    TransactionDialog,
    TransactionDialogStep,
} from '@/shared/components/transactionDialog';
import { useTranslations } from '@/shared/components/translationsProvider';
import { useStepper } from '@/shared/hooks/useStepper';
import { daoUtils } from '@/shared/utils/daoUtils';
import { invariant } from '@aragon/gov-ui-kit';
import { useRouter } from 'next/navigation';
import { useAccount } from 'wagmi';
import { tokenLockUnlockDialogUtils } from './tokenLockUnlockDialogUtils';

type ActionType = 'lock' | 'unlock' | 'withdraw';

export interface ITokenLockUnlockDialogParams {
    /**
     * Action to be performed.
     */
    action: ActionType;
    /**
     * DAO with the token-voting plugin.
     */
    dao: IDao;
    /**
     * Amount of tokens to be locked / unlocked in WEI format (required for lock action)
     */
    amount?: bigint;
    /**
     * The contract address of the voting escrow.
     */
    escrowContract: string;
    /**
     * Callback called on lock / unlock transaction success.
     */
    onSuccess?: () => void;
    /**
     * Callback called on success button click.
     */
    onSuccessClick?: () => void;
    /**
     * Callback called on cancel button click.
     */
    onClose?: () => void;
    /**
     * Token to be locked.
     */
    token: ITokenPluginSettingsToken;
    /**
     * Token ID for unlock/withdraw action (required for unlock and withdraw actions)
     */
    tokenId?: bigint;
    /**
     * Flag indicating whether to show the transaction info step in the dialog. Only shown when part of a two step transaction.
     */
    showTransactionInfo: boolean;
}

export interface ITokenLockUnlockDialogProps extends IDialogComponentProps<ITokenLockUnlockDialogParams> {}

const actionToTransactionType: Record<ActionType, TransactionType> = {
    lock: TransactionType.LOCK_CREATE,
    unlock: TransactionType.EXIT_CREATE,
    withdraw: TransactionType.WITHDRAW_CREATE,
};

export const TokenLockUnlockDialog: React.FC<ITokenLockUnlockDialogProps> = (props) => {
    const { location } = props;
    invariant(location.params != null, 'TokenLockUnlockDialog: required parameters must be set.');

    const { address } = useAccount();
    invariant(address != null, 'TokenLockUnlockDialog: user must be connected to perform the action');

    const {
        action,
        dao,
        amount,
        onSuccess,
        onSuccessClick,
        onClose,
        escrowContract,
        token,
        tokenId,
        showTransactionInfo,
    } = location.params;

    const { t } = useTranslations();
    const router = useRouter();

    const initialActiveStep = TransactionDialogStep.PREPARE;
    const stepper = useStepper<ITransactionDialogStepMeta, TransactionDialogStep>({ initialActiveStep });

    const handlePrepareTransaction = () => {
        if (action === 'lock') {
            invariant(amount != null, 'TokenLockUnlockDialog: amount is required for lock action');
            return tokenLockUnlockDialogUtils.buildLockTransaction(amount, escrowContract);
        } else if (action === 'unlock') {
            invariant(tokenId != null, 'TokenLockUnlockDialog: tokenId is required for unlock action');
            return tokenLockUnlockDialogUtils.buildUnlockTransaction(tokenId, escrowContract);
        } else {
            invariant(tokenId != null, 'TokenLockUnlockDialog: tokenId is required for withdraw action');
            return tokenLockUnlockDialogUtils.buildWithdrawTransaction(tokenId, escrowContract);
        }
    };

    const handleSuccessClick = () => {
        router.refresh();
        onSuccessClick?.();
    };

    const { symbol } = token;
    const txInfoTitle = t(`app.plugins.token.tokenLockUnlockDialog.${action}.transactionInfoTitle`, { symbol });
    const transactionInfo = showTransactionInfo ? { title: txInfoTitle, current: 2, total: 2 } : undefined;

    return (
        <TransactionDialog
            title={t(`app.plugins.token.tokenLockUnlockDialog.${action}.title`, { symbol })}
            description={t(`app.plugins.token.tokenLockUnlockDialog.${action}.description`, { symbol })}
            submitLabel={t(`app.plugins.token.tokenLockUnlockDialog.${action}.submit`)}
            stepper={stepper}
            prepareTransaction={handlePrepareTransaction}
            network={dao.network}
            onSuccess={onSuccess}
            successLink={{
                label: t(`app.plugins.token.tokenLockUnlockDialog.${action}.success`),
                onClick: handleSuccessClick,
            }}
            onCancelClick={onClose}
            transactionInfo={transactionInfo}
            transactionType={actionToTransactionType[action]}
            indexingFallbackUrl={daoUtils.getDaoUrl(dao, 'members')}
        />
    );
};
