import type { IToken } from '@/modules/finance/api/financeService';
import type { Network } from '@/shared/api/daoService';
import type { IDialogComponentProps } from '@/shared/components/dialogProvider';
import {
    TransactionDialog,
    TransactionDialogStep,
    type ITransactionDialogStepMeta,
} from '@/shared/components/transactionDialog';
import { useTranslations } from '@/shared/components/translationsProvider';
import { useStepper } from '@/shared/hooks/useStepper';
import { AssetDataListItem, invariant } from '@aragon/gov-ui-kit';
import { useRouter } from 'next/navigation';
import { formatUnits } from 'viem';
import { useAccount } from 'wagmi';
import { tokenLockUnlockDialogUtils } from './tokenLockUnlockDialogUtils';

export interface ITokenLockUnlockDialogParams {
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

export interface ITokenLockUnlockDialogProps extends IDialogComponentProps<ITokenLockUnlockDialogParams> {}

export const TokenLockUnlockDialog: React.FC<ITokenLockUnlockDialogProps> = (props) => {
    const { location } = props;
    invariant(location.params != null, 'TokenLockUnlockDialog: required parameters must be set.');

    const { address } = useAccount();
    invariant(address != null, 'TokenLockUnlockDialog: user must be connected to perform the action');

    const { action, token, lockManagerAddress, amount, network, onSuccess, showTransactionInfo } = location.params;

    const { t } = useTranslations();
    const router = useRouter();

    const initialActiveStep = TransactionDialogStep.PREPARE;
    const stepper = useStepper<ITransactionDialogStepMeta, TransactionDialogStep>({ initialActiveStep });

    const handlePrepareTransaction = () =>
        action === 'lock'
            ? tokenLockUnlockDialogUtils.buildLockTransaction({ lockManagerAddress, address })
            : tokenLockUnlockDialogUtils.buildUnlockTransaction({ lockManagerAddress, address });

    const parsedAmount = formatUnits(amount, token.decimals);

    const transactionInfo = {
        title: t(`app.plugins.lockToVote.tokenLockUnlockDialog.${action}.transactionInfoTitle`, {
            symbol: token.symbol,
        }),
        current: 2,
        total: 2,
    };

    return (
        <TransactionDialog
            title={t(`app.plugins.lockToVote.tokenLockUnlockDialog.${action}.title`)}
            description={t(`app.plugins.lockToVote.tokenLockUnlockDialog.${action}.description`)}
            submitLabel={t(`app.plugins.lockToVote.tokenLockUnlockDialog.${action}.submit`)}
            stepper={stepper}
            prepareTransaction={handlePrepareTransaction}
            network={network}
            onSuccess={onSuccess}
            successLink={{
                label: t(`app.plugins.lockToVote.tokenLockUnlockDialog.${action}.success`),
                onClick: () => router.refresh(),
            }}
            transactionInfo={showTransactionInfo ? transactionInfo : undefined}
        >
            <AssetDataListItem.Structure
                logoSrc={token.logo}
                name={token.name}
                amount={parsedAmount}
                symbol={token.symbol}
                hideValue={true}
            />
        </TransactionDialog>
    );
};
