import type { Network } from '@/shared/api/daoService';
import {
    TransactionDialog,
    TransactionDialogStep,
    type ITransactionDialogStepMeta,
} from '@/shared/components/transactionDialog';
import { useTranslations } from '@/shared/components/translationsProvider';
import { useStepper } from '@/shared/hooks/useStepper';
import { AssetDataListItem, Dialog, invariant, type IDialogRootProps } from '@aragon/gov-ui-kit';
import { useRouter } from 'next/navigation';
import { formatUnits } from 'viem';
import { useAccount } from 'wagmi';
import type { ITokenPluginSettingsToken } from '../../types';
import { tokenWrapFormDialogUtils } from './tokenWrapFormDialogUtils';

export interface ITokenWrapFormDialogUnwrapProps extends IDialogRootProps {
    /**
     * Wrapper governance token.
     */
    token: ITokenPluginSettingsToken;
    /**
     * Amount of tokens to be unwrapped in WEI format.
     */
    amount: bigint;
    /**
     * Network used for the transaction.
     */
    network: Network;
    /**
     * Callback called on unwrap transaction success.
     */
    onSuccess?: () => void;
}

export const TokenWrapFormDialogUnwrap: React.FC<ITokenWrapFormDialogUnwrapProps> = (props) => {
    const { token, amount, network, onOpenChange, onSuccess, ...otherProps } = props;

    const { t } = useTranslations();
    const router = useRouter();
    const { address } = useAccount();

    invariant(address != null, 'TokenWrapFormDialogUnwrap: user must be connected to perform the action');

    const initialActiveStep = TransactionDialogStep.PREPARE;
    const stepper = useStepper<ITransactionDialogStepMeta, TransactionDialogStep>({ initialActiveStep });

    const handlePrepareTransaction = () => tokenWrapFormDialogUtils.buildUnwrapTransaction({ token, address, amount });

    const onSuccessClick = () => {
        router.refresh();
        onOpenChange?.(false);
    };

    const handleCloseDialog = () => {
        stepper.updateActiveStep(initialActiveStep);
        onOpenChange?.(false);
    };

    const parsedAmount = formatUnits(amount, token.decimals);

    return (
        <Dialog.Root onOpenChange={handleCloseDialog} {...otherProps}>
            <TransactionDialog
                title={t('app.plugins.token.tokenWrapForm.dialog.unwrap.title')}
                description={t('app.plugins.token.tokenWrapForm.dialog.unwrap.description')}
                submitLabel={t('app.plugins.token.tokenWrapForm.dialog.unwrap.submit')}
                stepper={stepper}
                prepareTransaction={handlePrepareTransaction}
                onCancelClick={handleCloseDialog}
                network={network}
                onSuccess={onSuccess}
                successLink={{
                    label: t('app.plugins.token.tokenWrapForm.dialog.unwrap.success'),
                    onClick: onSuccessClick,
                }}
            >
                <AssetDataListItem.Structure
                    logoSrc={token.logo}
                    name={token.name}
                    amount={parsedAmount}
                    symbol={token.symbol}
                    fiatPrice={token.priceUsd}
                />
            </TransactionDialog>
        </Dialog.Root>
    );
};
