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
import type { ITokenPluginSettingsToken } from '../../types';
import { tokenWrapUnwrapDialogUtils } from './tokenWrapUnwrapDialogUtils';

export interface ITokenWrapUnwrapDialogParams {
    /**
     * Action to be performed.
     */
    action: 'wrap' | 'unwrap';
    /**
     * Wrapper governance token.
     */
    token: ITokenPluginSettingsToken;
    /**
     * Underlying token of the wrapper governance token.
     */
    underlyingToken: IToken;
    /**
     * Amount of tokens to be wrapped / unwrapped in WEI format.
     */
    amount: bigint;
    /**
     * Network used for the transaction.
     */
    network: Network;
    /**
     * Callback called on wrap / unwrap transaction success.
     */
    onSuccess?: () => void;
}

export interface ITokenWrapUnwrapDialogProps extends IDialogComponentProps<ITokenWrapUnwrapDialogParams> {}

export const TokenWrapUnwrapDialog: React.FC<ITokenWrapUnwrapDialogProps> = (props) => {
    const { location } = props;
    invariant(location.params != null, 'TokenWrapFormDialogAction: required parameters must be set.');

    const { address } = useAccount();
    invariant(address != null, 'TokenWrapFormDialogAction: user must be connected to perform the action');

    const { action, token, underlyingToken, amount, network, onSuccess } = location.params;

    const { t } = useTranslations();
    const router = useRouter();

    const initialActiveStep = TransactionDialogStep.PREPARE;
    const stepper = useStepper<ITransactionDialogStepMeta, TransactionDialogStep>({ initialActiveStep });

    const handlePrepareTransaction = () =>
        action === 'wrap'
            ? tokenWrapUnwrapDialogUtils.buildWrapTransaction({ token, address, amount })
            : tokenWrapUnwrapDialogUtils.buildUnwrapTransaction({ token, address, amount });

    const onSuccessClick = () => {
        router.refresh();
    };

    const parsedAmount = formatUnits(amount, token.decimals);
    const assetToken = action === 'wrap' ? underlyingToken : token;

    return (
        <TransactionDialog
            title={t(`app.plugins.token.tokenWrapUnwrapDialog.${action}.title`)}
            description={t(`app.plugins.token.tokenWrapUnwrapDialog.${action}.description`)}
            submitLabel={t(`app.plugins.token.tokenWrapUnwrapDialog.${action}.submit`)}
            stepper={stepper}
            prepareTransaction={handlePrepareTransaction}
            network={network}
            onSuccess={onSuccess}
            successLink={{
                label: t(`app.plugins.token.tokenWrapUnwrapDialog.${action}.success`),
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
