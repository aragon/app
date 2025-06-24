'use client';

import type { ITokenPluginSettingsToken } from '@/plugins/tokenPlugin/types';
import { type Network, useDao } from '@/shared/api/daoService';
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
     * ID of the DAO.
     */
    daoId: string;
    /**
     * Amount of tokens to be locked / unlocked in WEI format.
     * Required for lock action.
     */
    amount?: bigint;
    /**
     * The contract address of the voting escrow.
     */
    escrowContract: string;
    /**
     * Network used for the transaction.
     */
    network: Network;
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
     * Token ID for unlock/withdraw action.
     * Required for unlock and withdraw actions.
     */
    tokenId?: bigint;
    /**
     * Flag indicating whether to show the transaction info step in the dialog. Only shown when part of a two step transaction.
     */
    showTransactionInfo: boolean;
}

export interface ITokenLockUnlockDialogProps extends IDialogComponentProps<ITokenLockUnlockDialogParams> {}

export const TokenLockUnlockDialog: React.FC<ITokenLockUnlockDialogProps> = (props) => {
    const { location } = props;
    invariant(location.params != null, 'TokenLockUnlockDialog: required parameters must be set.');

    const { address } = useAccount();
    invariant(address != null, 'TokenLockUnlockDialog: user must be connected to perform the action');

    const {
        action,
        daoId,
        amount,
        network,
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
    const { data: dao } = useDao({ urlParams: { id: daoId } });

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

    const transactionTypeMap = {
        lock: TransactionType.LOCK_CREATE,
        unlock: TransactionType.EXIT_CREATE,
        withdraw: TransactionType.WITHDRAW_CREATE,
    };

    const handleSuccessClick = () => {
        router.refresh();
        onSuccessClick?.();
    };

    const tokenSymbol = token.symbol;

    const transactionInfo = showTransactionInfo
        ? {
              title: t(`app.plugins.token.tokenLockUnlockDialog.${action}.transactionInfoTitle`, {
                  symbol: tokenSymbol,
              }),
              current: 2,
              total: 2,
          }
        : undefined;

    return (
        <TransactionDialog
            title={t(`app.plugins.token.tokenLockUnlockDialog.${action}.title`, { symbol: tokenSymbol })}
            description={t(`app.plugins.token.tokenLockUnlockDialog.${action}.description`, { symbol: tokenSymbol })}
            submitLabel={t(`app.plugins.token.tokenLockUnlockDialog.${action}.submit`)}
            stepper={stepper}
            prepareTransaction={handlePrepareTransaction}
            network={network}
            onSuccess={onSuccess}
            successLink={{
                label: t(`app.plugins.token.tokenLockUnlockDialog.${action}.success`),
                onClick: handleSuccessClick,
            }}
            onCancelClick={onClose}
            transactionInfo={transactionInfo}
            transactionType={transactionTypeMap[action]}
            indexingFallbackUrl={daoUtils.getDaoUrl(dao, 'members')}
        />
    );
};
