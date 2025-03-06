import type { Network } from '@/shared/api/daoService';
import {
    TransactionDialog,
    TransactionDialogStep,
    type ITransactionDialogStepMeta,
} from '@/shared/components/transactionDialog';
import { useTranslations } from '@/shared/components/translationsProvider';
import { useStepper } from '@/shared/hooks/useStepper';
import { AssetDataListItem, Dialog, invariant, type IDialogRootProps } from '@aragon/gov-ui-kit';
import { useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { erc20Abi, parseUnits, type Hex } from 'viem';
import { useAccount, useReadContract } from 'wagmi';
import type { ITokenPluginSettingsToken } from '../../types';
import { tokenWrapFormDialogUtils } from './tokenWrapFormDialogUtils';

export interface ITokenWrapFormDialogWrapProps extends IDialogRootProps {
    /**
     * Wrapper governance token.
     */
    token: ITokenPluginSettingsToken;
    /**
     * Amount of tokens to be wrapped formatted using the token decimals.
     */
    amount: string;
    /**
     * Network used for the transaction.
     */
    network: Network;
    /**
     * Callback called when on approve success button click.
     */
    onApproveSuccess: () => void;
    /**
     * Callback called on approve / wrap transaction success.
     */
    onSuccess?: () => void;
}

export const TokenWrapFormDialogWrap: React.FC<ITokenWrapFormDialogWrapProps> = (props) => {
    const { token, amount, network, onOpenChange, onApproveSuccess, onSuccess, ...otherProps } = props;

    const { t } = useTranslations();
    const router = useRouter();
    const { address } = useAccount();
    const queryClient = useQueryClient();

    invariant(address != null, 'TokenWrapFormDialogWrap: user must be connected to perform the action');

    const {
        data: tokenAllowance,
        queryKey: allowanceQueryKey,
        status: allowanceStatus,
    } = useReadContract({
        abi: erc20Abi,
        functionName: 'allowance',
        address: token.underlying as Hex,
        args: [address, token.address as Hex],
    });

    const initialActiveStep = TransactionDialogStep.PREPARE;
    const stepper = useStepper<ITransactionDialogStepMeta, TransactionDialogStep>({ initialActiveStep });

    const weiAmount = parseUnits(amount, token.decimals);
    const needsApproveTransaction = tokenAllowance == null || tokenAllowance < weiAmount;
    const context = needsApproveTransaction ? 'approve' : 'wrap';

    const handlePrepareTransaction = () => {
        if (needsApproveTransaction) {
            return tokenWrapFormDialogUtils.buildApproveTransaction({ token, amount: weiAmount });
        } else {
            return tokenWrapFormDialogUtils.buildWrapTransaction({ token, address, amount: weiAmount });
        }
    };

    const handleCloseDialog = () => {
        stepper.updateActiveStep(initialActiveStep);
        onOpenChange?.(false);
    };

    const handleTransactionSuccess = () => {
        if (needsApproveTransaction) {
            void queryClient.invalidateQueries({ queryKey: allowanceQueryKey });
        }

        onSuccess?.();
    };

    const onSuccessClick = () => {
        handleCloseDialog();

        if (needsApproveTransaction) {
            onApproveSuccess();
        } else {
            router.refresh();
        }
    };

    // Do not render dialog when allowance hasn't been fetched yet to set the proper mutations on transaction-dialog mount
    if (allowanceStatus === 'pending') {
        return null;
    }

    return (
        <Dialog.Root onOpenChange={handleCloseDialog} {...otherProps}>
            <TransactionDialog
                title={t(`app.plugins.token.tokenWrapForm.dialog.${context}.title`)}
                description={t(`app.plugins.token.tokenWrapForm.dialog.${context}.description`)}
                submitLabel={t(`app.plugins.token.tokenWrapForm.dialog.${context}.submit`)}
                stepper={stepper}
                prepareTransaction={handlePrepareTransaction}
                onCancelClick={handleCloseDialog}
                network={network}
                onSuccess={handleTransactionSuccess}
                successLink={{
                    label: t(`app.plugins.token.tokenWrapForm.dialog.${context}.success`),
                    onClick: onSuccessClick,
                }}
            >
                <AssetDataListItem.Structure
                    logoSrc={token.logo}
                    name={token.name}
                    amount={amount}
                    symbol={token.symbol}
                    fiatPrice={token.priceUsd}
                />
            </TransactionDialog>
        </Dialog.Root>
    );
};
