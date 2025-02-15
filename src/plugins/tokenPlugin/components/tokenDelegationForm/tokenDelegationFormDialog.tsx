import type { IDialogRootProps } from '@/shared/components/dialogRoot';
import {
    type ITransactionDialogStepMeta,
    TransactionDialog,
    TransactionDialogStep,
} from '@/shared/components/transactionDialog';
import { useTranslations } from '@/shared/components/translationsProvider';
import { useStepper } from '@/shared/hooks/useStepper';
import { Dialog, MemberDataListItem } from '@aragon/gov-ui-kit';
import { useRouter } from 'next/navigation';
import { tokenDelegationFormDialogUtils } from './tokenDelegationFormDialogUtils';

export interface ITokenDelegationFormDialogProps extends IDialogRootProps {}

export const TokenDelegationFormDialog: React.FC<ITokenDelegationFormDialogProps> = (props) => {
    const { onOpenChange, ...otherProps } = props;

    const { t } = useTranslations();
    const router = useRouter();

    const initialActiveStep = TransactionDialogStep.PREPARE;
    const stepper = useStepper<ITransactionDialogStepMeta, TransactionDialogStep>({ initialActiveStep });

    const handlePrepareTransaction = () => tokenDelegationFormDialogUtils.buildTransaction();

    const onSuccessClick = () => {
        router.refresh();
        onOpenChange?.(false);
    };

    const handleCloseDialog = () => {
        onOpenChange?.(false);
        stepper.updateActiveStep(initialActiveStep);
    };

    return (
        <Dialog.Root onOpenChange={handleCloseDialog} {...otherProps}>
            <TransactionDialog
                title={t('app.plugins.spp.advanceStageDialog.title')}
                description={t('app.plugins.spp.advanceStageDialog.description')}
                submitLabel={t('app.plugins.spp.advanceStageDialog.button.submit')}
                stepper={stepper}
                prepareTransaction={handlePrepareTransaction}
                onCancelClick={handleCloseDialog}
                network={proposal.network}
                successLink={{
                    label: t('app.plugins.spp.advanceStageDialog.button.success'),
                    onClick: onSuccessClick,
                }}
            >
                <MemberDataListItem.Structure />
            </TransactionDialog>
        </Dialog.Root>
    );
};
