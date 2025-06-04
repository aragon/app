import type { IToken } from '@/modules/finance/api/financeService';
import { tokenLockUnlockDialogUtils } from './tokenLockUnlockDialogUtils';
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
import { AssetDataListItem, invariant } from '@aragon/gov-ui-kit';
import { useRouter } from 'next/navigation';
import { formatUnits } from 'viem';
import { useAccount } from 'wagmi';

export interface ITokenLockUnlockDialogParams {
    /**
     * Action to be performed.
     */
    action: 'lock' | 'unlock';
    /**
     * Token adapter.
     */
    token: ITokenPluginSettingsToken;
    /**
     * Underlying token of the adapter.
     */
    underlyingToken: IToken;
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
}

export interface ITokenLockUnlockDialogProps extends IDialogComponentProps<ITokenLockUnlockDialogParams> {}

export const TokenLockUnlockDialog: React.FC<ITokenLockUnlockDialogProps> = (props) => {
    const { location } = props;
    invariant(location.params != null, 'TokenLockUnlockDialog: required parameters must be set.');

    const { address } = useAccount();
    invariant(address != null, 'TokenLockUnlockDialog: user must be connected to perform the action');

    const { action, token, underlyingToken, amount, network, onSuccess } = location.params;

    const { t } = useTranslations();
    const router = useRouter();

    const initialActiveStep = TransactionDialogStep.PREPARE;
    const stepper = useStepper<ITransactionDialogStepMeta, TransactionDialogStep>({ initialActiveStep });

    const handlePrepareTransaction = () =>
        action === 'lock'
            ? tokenLockUnlockDialogUtils.buildLockTransaction(amount)
            : tokenLockUnlockDialogUtils.buildUnlockTransaction();

    const onSuccessClick = () => {
        router.refresh();
    };

    const parsedAmount = formatUnits(amount, token.decimals);
    const assetToken = action === 'lock' ? underlyingToken : token;

    return (
        <TransactionDialog
            title={t(`app.plugins.token.tokenLockUnlockDialog.${action}.title`)}
            description={t(`app.plugins.token.tokenLockUnlockDialog.${action}.description`)}
            submitLabel={t(`app.plugins.token.tokenLockUnlockDialog.${action}.submit`)}
            stepper={stepper}
            prepareTransaction={handlePrepareTransaction}
            network={network}
            onSuccess={onSuccess}
            successLink={{
                label: t(`app.plugins.token.tokenLockUnlockDialog.${action}.success`),
                onClick: onSuccessClick,
            }}
        >
            <AssetDataListItem.Structure
                logoSrc={assetToken.logo}
                name={assetToken.name}
                amount={parsedAmount}
                symbol={assetToken.symbol}
                hideValue={true}
            />
        </TransactionDialog>
    );
};
