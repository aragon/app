import type { Network } from '@/shared/api/daoService';
import {
    TransactionDialog,
    TransactionDialogStep,
    type ITransactionDialogStepMeta,
} from '@/shared/components/transactionDialog';
import { useTranslations } from '@/shared/components/translationsProvider';
import { useStepper } from '@/shared/hooks/useStepper';
import { Dialog, invariant, type IDialogRootProps } from '@aragon/gov-ui-kit';
import { useAccount } from 'wagmi';
import type { ITokenPluginSettingsToken } from '../../types';
import { tokenWrapFormDialogUtils } from './tokenWrapFormDialogUtils';

export interface ITokenWrapFormDialogApproveProps extends IDialogRootProps {
    /**
     * Wrapper governance token.
     */
    token: ITokenPluginSettingsToken;
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
    const { token, amount, network, onOpenChange, onApproveSuccess, onSuccess, ...otherProps } = props;

    const { t } = useTranslations();
    const { address } = useAccount();

    invariant(address != null, 'TokenWrapFormDialogApprove: user must be connected to perform the action');

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
            />
        </Dialog.Root>
    );
};
