import { invariant } from '@aragon/gov-ui-kit';
import { useWalletAccount } from '@/modules/application/hooks/useWalletAccount';
import { useDao } from '@/shared/api/daoService';
import {
    type ITransactionDialogStepMeta,
    TransactionDialog,
    TransactionDialogStep,
} from '@/shared/components/transactionDialog';
import { useTranslations } from '@/shared/components/translationsProvider';
import { useStepper } from '@/shared/hooks/useStepper';
import { daoUtils } from '@/shared/utils/daoUtils';
import type { IExecuteActionsDialogProps } from './executeActionsDialog.api';
import { executeActionsDialogUtils } from './executeActionsDialogUtils';

export const ExecuteActionsDialog: React.FC<IExecuteActionsDialogProps> = (
    props,
) => {
    const { location } = props;

    invariant(
        location.params != null,
        'ExecuteActionsDialog: required parameters must be set.',
    );

    const { address } = useWalletAccount();
    invariant(address != null, 'ExecuteActionsDialog: user must be connected.');

    const { daoId, actions, prepareActions } = location.params;

    const { t } = useTranslations();
    const { data: dao } = useDao({ urlParams: { id: daoId } });

    const stepper = useStepper<
        ITransactionDialogStepMeta,
        TransactionDialogStep
    >({ initialActiveStep: TransactionDialogStep.PREPARE });

    const handlePrepareTransaction = async () => {
        invariant(
            dao != null,
            'ExecuteActionsDialog: DAO must be defined to prepare the transaction.',
        );

        const preparedActions = await executeActionsDialogUtils.prepareActions({
            actions,
            prepareActions,
        });

        return executeActionsDialogUtils.buildExecuteTransaction({
            dao,
            preparedActions,
        });
    };

    return (
        <TransactionDialog
            completeOnSubmit={true}
            description={t('app.governance.executeActionsDialog.description')}
            network={dao?.network}
            prepareTransaction={handlePrepareTransaction}
            stepper={stepper}
            submitLabel={t('app.governance.executeActionsDialog.button.submit')}
            successLink={{
                label: t('app.governance.executeActionsDialog.button.success'),
                href: daoUtils.getDaoUrl(dao, 'transactions'),
            }}
            title={t('app.governance.executeActionsDialog.title')}
        />
    );
};
