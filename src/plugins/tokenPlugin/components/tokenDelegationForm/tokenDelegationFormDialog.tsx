import type { Network } from '@/shared/api/daoService';
import {
    type ITransactionDialogStepMeta,
    TransactionDialog,
    TransactionDialogStep,
} from '@/shared/components/transactionDialog';
import { useTranslations } from '@/shared/components/translationsProvider';
import { useStepper } from '@/shared/hooks/useStepper';
import { Dialog, type IDialogRootProps, MemberDataListItem } from '@aragon/gov-ui-kit';
import { useRouter } from 'next/navigation';
import { zeroAddress } from 'viem';
import { tokenDelegationFormDialogUtils } from './tokenDelegationFormDialogUtils';

export interface ITokenDelegationFormDialogProps extends IDialogRootProps {
    /**
     * Address of the token.
     */
    token: string;
    /**
     * Address to delegate the voting power to.
     */
    delegate?: string;
    /**
     * Network used for the transaction.
     */
    network: Network;
}

export const TokenDelegationFormDialog: React.FC<ITokenDelegationFormDialogProps> = (props) => {
    const { token, delegate = zeroAddress, network, onOpenChange, ...otherProps } = props;

    const { t } = useTranslations();
    const router = useRouter();

    const initialActiveStep = TransactionDialogStep.PREPARE;
    const stepper = useStepper<ITransactionDialogStepMeta, TransactionDialogStep>({ initialActiveStep });

    const handlePrepareTransaction = () => tokenDelegationFormDialogUtils.buildTransaction(token, delegate);

    const onSuccessClick = () => {
        router.refresh();
        onOpenChange?.(false);
    };

    const handleCloseDialog = () => {
        onOpenChange?.(false);
        stepper.updateActiveStep(initialActiveStep);
    };

      const handlePreventClose = (e: Event) => {
          e.preventDefault();
      };

    return (
        <Dialog.Root
            onInteractOutside={handlePreventClose}
            onEscapeKeyDown={handlePreventClose}
            onOpenChange={handleCloseDialog}
            {...otherProps}
        >
            <TransactionDialog
                title={t('app.plugins.token.tokenDelegationForm.dialog.title')}
                description={t('app.plugins.token.tokenDelegationForm.dialog.description')}
                submitLabel={t('app.plugins.token.tokenDelegationForm.dialog.button.submit')}
                stepper={stepper}
                prepareTransaction={handlePrepareTransaction}
                onCancelClick={handleCloseDialog}
                network={network}
                successLink={{
                    label: t('app.plugins.token.tokenDelegationForm.dialog.button.success'),
                    onClick: onSuccessClick,
                }}
            >
                <MemberDataListItem.Structure address={delegate} isDelegate={true} />
            </TransactionDialog>
        </Dialog.Root>
    );
};
