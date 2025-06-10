import type { ITokenPluginSettingsToken } from '@/plugins/tokenPlugin/types';
import type { Network } from '@/shared/api/daoService';
import type { IDialogComponentProps } from '@/shared/components/dialogProvider';
import {
    type ITransactionDialogStepMeta,
    TransactionDialog,
    TransactionDialogStep,
} from '@/shared/components/transactionDialog';
import { useTranslations } from '@/shared/components/translationsProvider';
import { useStepper } from '@/shared/hooks/useStepper';
import { invariant } from '@aragon/gov-ui-kit';
import { useRouter } from 'next/navigation';
import { useAccount } from 'wagmi';
import { tokenLockUnlockDialogUtils } from './tokenLockUnlockDialogUtils';

export interface ITokenLockUnlockDialogParams {
    /**
     * Action to be performed.
     */
    action: 'lock' | 'unlock' | 'withdraw';
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
     * Token to be locked.
     */
    token: ITokenPluginSettingsToken;
    /**
     * Token ID for unlock/withdraw action.
     * Required for unlock and withdraw actions.
     */
    tokenId?: bigint;
}

export interface ITokenLockUnlockDialogProps extends IDialogComponentProps<ITokenLockUnlockDialogParams> {}

export const TokenLockUnlockDialog: React.FC<ITokenLockUnlockDialogProps> = (props) => {
    const { location } = props;
    invariant(location.params != null, 'TokenLockUnlockDialog: required parameters must be set.');

    const { address } = useAccount();
    invariant(address != null, 'TokenLockUnlockDialog: user must be connected to perform the action');

    const { action, amount, network, onSuccess, escrowContract, token, tokenId } = location.params;

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

    const onSuccessClick = () => {
        router.refresh();
    };

    const tokenSymbol = token.symbol;

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
                onClick: onSuccessClick,
            }}
            transactionInfo={{
                title: t(`app.plugins.token.tokenLockUnlockDialog.${action}.transactionInfoTitle`, {
                    symbol: tokenSymbol,
                }),
                current: 2,
                total: 2,
            }}
        />
    );
};
