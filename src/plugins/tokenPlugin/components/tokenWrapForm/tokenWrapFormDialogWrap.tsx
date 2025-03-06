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
import { parseUnits } from 'viem';
import { useAccount } from 'wagmi';
import type { ITokenPluginSettingsToken } from '../../types';
import { tokenWrapFormDialogUtils } from './tokenWrapFormDialogUtils';

export interface ITokenWrapFormDialogWrapProps extends IDialogRootProps {
    /**
     * Wrapped governance token.
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
}

export const TokenWrapFormDialogWrap: React.FC<ITokenWrapFormDialogWrapProps> = (props) => {
    const { token, amount, network, onOpenChange, ...otherProps } = props;

    const { t } = useTranslations();
    const router = useRouter();
    const { address } = useAccount();

    invariant(address != null, 'TokenWrapFormDialogWrap: user must be connected to perform the action');

    const initialActiveStep = TransactionDialogStep.PREPARE;
    const stepper = useStepper<ITransactionDialogStepMeta, TransactionDialogStep>({ initialActiveStep });

    const handlePrepareTransaction = () => {
        const weiAmount = parseUnits(amount, token.decimals);
        return tokenWrapFormDialogUtils.buildWrapTransaction({ token, address, amount: weiAmount });
    };

    const onSuccessClick = () => {
        router.refresh();
        onOpenChange?.(false);
    };

    const handleCloseDialog = () => {
        stepper.updateActiveStep(initialActiveStep);
        onOpenChange?.(false);
    };

    return (
        <Dialog.Root onOpenChange={handleCloseDialog} {...otherProps}>
            <TransactionDialog
                title={t('app.plugins.token.tokenWrapForm.dialog.wrap.title')}
                description={t('app.plugins.token.tokenWrapForm.dialog.wrap.description')}
                submitLabel={t('app.plugins.token.tokenWrapForm.dialog.wrap.submit')}
                stepper={stepper}
                prepareTransaction={handlePrepareTransaction}
                onCancelClick={handleCloseDialog}
                network={network}
                successLink={{
                    label: t('app.plugins.token.tokenWrapForm.dialog.success'),
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
