import type { IToken } from '@/modules/finance/api/financeService';
import type { Network } from '@/shared/api/daoService';
import {
    TransactionDialog,
    TransactionDialogStep,
    type ITransactionDialogStepMeta,
} from '@/shared/components/transactionDialog';
import { useTranslations } from '@/shared/components/translationsProvider';
import { useStepper } from '@/shared/hooks/useStepper';
import { AssetDataListItem, Dialog, type IDialogRootProps } from '@aragon/gov-ui-kit';
import { formatUnits } from 'viem';
import type { ITokenPluginSettingsToken } from '../../types';
import { tokenWrapFormDialogUtils } from './tokenWrapFormDialogUtils';

export interface ITokenWrapFormDialogApproveProps extends IDialogRootProps {
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

export const TokenWrapFormDialogApprove: React.FC<ITokenWrapFormDialogApproveProps> = (props) => {
    const { token, underlyingToken, amount, network, onOpenChange, onApproveSuccess, onSuccess, ...otherProps } = props;

    const { t } = useTranslations();

    const initialActiveStep = TransactionDialogStep.PREPARE;
    const stepper = useStepper<ITransactionDialogStepMeta, TransactionDialogStep>({ initialActiveStep });

    const handlePrepareTransaction = () => tokenWrapFormDialogUtils.buildApproveTransaction({ token, amount });

    const handleCloseDialog = () => {
        stepper.updateActiveStep(initialActiveStep);
        onOpenChange?.(false);
    };

    const onSuccessClick = () => {
        handleCloseDialog();
        onApproveSuccess();
    };

    const parsedAmount = formatUnits(amount, token.decimals);

    return (
        <Dialog.Root onOpenChange={handleCloseDialog} {...otherProps}>
            <TransactionDialog
                title={t('app.plugins.token.tokenWrapForm.dialog.approve.title')}
                description={t('app.plugins.token.tokenWrapForm.dialog.approve.description')}
                submitLabel={t('app.plugins.token.tokenWrapForm.dialog.approve.submit')}
                stepper={stepper}
                prepareTransaction={handlePrepareTransaction}
                onCancelClick={handleCloseDialog}
                network={network}
                onSuccess={onSuccess}
                successLink={{
                    label: t('app.plugins.token.tokenWrapForm.dialog.approve.success'),
                    onClick: onSuccessClick,
                }}
            >
                <AssetDataListItem.Structure
                    logoSrc={underlyingToken.logo}
                    name={underlyingToken.name}
                    amount={parsedAmount}
                    symbol={underlyingToken.symbol}
                />
            </TransactionDialog>
        </Dialog.Root>
    );
};
