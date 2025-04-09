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
import { formatUnits } from 'viem';
import { useAccount } from 'wagmi';
import type { ITokenPluginSettingsToken } from '../../types';
import { tokenApproveTokensDialogUtils } from './tokenApproveTokensDialogUtils';

export interface ITokenApproveTokensDialogParams {
    /**
     * Wrapper governance token.
     */
    token: ITokenPluginSettingsToken;
    /**
     * Underlying token of the wrapper governance token.
     */
    underlyingToken: IToken;
    /**
     * Amount of tokens to be approved in WEI format.
     */
    amount: bigint;
    /**
     * Network used for the transaction.
     */
    network: Network;
    /**
     * Callback called when on approve success button click.
     */
    onApproveSuccess: () => void;
    /**
     * Callback called on approve transaction success.
     */
    onSuccess?: () => void;
}

export interface ITokenApproveTokensDialogProps extends IDialogComponentProps<ITokenApproveTokensDialogParams> {}

export const TokenApproveTokensDialog: React.FC<ITokenApproveTokensDialogProps> = (props) => {
    const { location } = props;
    invariant(location.params != null, 'TokenWrapFormDialogApprove: required parameters must be set.');

    const { address } = useAccount();
    invariant(address != null, 'TokenWrapFormDialogApprove: user must be connected.');

    const { token, underlyingToken, amount, network, onApproveSuccess, onSuccess } = location.params;

    const { t } = useTranslations();

    const initialActiveStep = TransactionDialogStep.PREPARE;
    const stepper = useStepper<ITransactionDialogStepMeta, TransactionDialogStep>({ initialActiveStep });

    const handlePrepareTransaction = () => tokenApproveTokensDialogUtils.buildApproveTransaction({ token, amount });

    const onSuccessClick = () => {
        onApproveSuccess();
    };

    const parsedAmount = formatUnits(amount, token.decimals);

    return (
        <TransactionDialog
            title={t('app.plugins.token.tokenApproveTokensDialog.title')}
            description={t('app.plugins.token.tokenApproveTokensDialog.description')}
            submitLabel={t('app.plugins.token.tokenApproveTokensDialog.submit')}
            stepper={stepper}
            prepareTransaction={handlePrepareTransaction}
            network={network}
            onSuccess={onSuccess}
            successLink={{
                label: t('app.plugins.token.tokenApproveTokensDialog.success'),
                onClick: onSuccessClick,
            }}
        >
            <AssetDataListItem.Structure
                logoSrc={underlyingToken.logo}
                name={underlyingToken.name}
                amount={parsedAmount}
                symbol={underlyingToken.symbol}
                hideValue={true}
            />
        </TransactionDialog>
    );
};
