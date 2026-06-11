import { Dialog, DialogFooter, IconType, invariant } from '@aragon/gov-ui-kit';
import { useMutation } from '@tanstack/react-query';
import { useCallback, useEffect, useState } from 'react';
import { match } from 'ts-pattern';
import { useSendTransaction } from 'wagmi';
import { useWalletAccount } from '@/modules/application/hooks/useWalletAccount';
import { useDao } from '@/shared/api/daoService';
import { useBlockNavigationContext } from '@/shared/components/blockNavigationContext';
import { useDialogContext } from '@/shared/components/dialogProvider';
import { NetworkSwitchAlert } from '@/shared/components/networkSwitchAlert';
import { transactionDialogUtils } from '@/shared/components/transactionDialog/transactionDialogUtils';
import {
    type ITransactionStatusStep,
    TransactionStatus,
    type TransactionStatusState,
} from '@/shared/components/transactionStatus';
import { useTranslations } from '@/shared/components/translationsProvider';
import { useNetworkSwitch } from '@/shared/hooks/useNetworkSwitch';
import { daoUtils } from '@/shared/utils/daoUtils';
import type { IExecuteActionsDialogProps } from './executeActionsDialog.api';
import { executeActionsDialogUtils } from './executeActionsDialogUtils';

// Steps of the execute-actions flow: build the transaction, then dispatch it to the wallet.
enum ExecuteActionsStep {
    PREPARE = 'PREPARE',
    SUBMIT = 'SUBMIT',
}

// Delay the auto-prepare to avoid a double mutation under React StrictMode in development
// (see https://github.com/TanStack/query/issues/5341).
const autoPrepareDelay = 100;

/**
 * Dialog to execute actions directly on the DAO.
 *
 * Unlike the generic `TransactionDialog`, this is a deliberately light, fire-and-forget flow: it
 * prepares the transaction, dispatches it to the wallet, and completes immediately, without
 * waiting for the signature, rejection, or an on-chain receipt. The transaction is typically sent
 * to a Safe, where signing is asynchronous and can take a long time.
 */
export const ExecuteActionsDialog: React.FC<IExecuteActionsDialogProps> = (
    props,
) => {
    const { location } = props;

    invariant(
        location.params != null,
        'ExecuteActionsDialog: required parameters must be set.',
    );

    const { address } = useWalletAccount();

    const { daoId, actions, prepareActions } = location.params;

    const { t } = useTranslations();
    const { close } = useDialogContext();
    const { setIsBlocked } = useBlockNavigationContext();
    const { data: dao } = useDao({ urlParams: { id: daoId } });
    const {
        isCrossNetworkTransaction,
        networkName,
        switchChainStatus,
        withNetworkSwitch,
    } = useNetworkSwitch({ daoId });

    const [isSubmitted, setIsSubmitted] = useState(false);

    const { mutate: sendTransaction, status: sendStatus } =
        useSendTransaction();

    // A rejection that comes back straight away (e.g. an RPC issue or an instant wallet reject)
    // flips the send mutation to "error"; surface that instead of the optimistic success state.
    const sendFailed = sendStatus === 'error';

    const submitState: TransactionStatusState = sendFailed
        ? 'error'
        : isSubmitted
          ? 'success'
          : isCrossNetworkTransaction
            ? switchChainStatus
            : 'idle';

    // Once the transaction is successfully submitted, unblock navigation so that clicking the
    // success link does not trigger the confirm-exit guard of the still-dirty wizard form behind
    // the dialog.
    useEffect(() => {
        if (submitState === 'success') {
            setIsBlocked(false);
        }
    }, [submitState, setIsBlocked]);

    const monitorError = useCallback(
        (error: unknown) =>
            transactionDialogUtils.monitorTransactionError(error, {
                from: address,
            }),
        [address],
    );

    const prepareTransaction = useCallback(async () => {
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
    }, [dao, actions, prepareActions]);

    const {
        mutate: prepare,
        status: prepareStatus,
        data: transaction,
    } = useMutation({
        mutationFn: prepareTransaction,
        onError: monitorError,
    });

    // Auto-prepare the transaction once the DAO is loaded.
    useEffect(() => {
        if (dao == null || prepareStatus !== 'idle') {
            return;
        }

        const timeout = setTimeout(() => prepare(), autoPrepareDelay);
        return () => clearTimeout(timeout);
    }, [dao, prepareStatus, prepare]);

    const handleSend = useCallback(() => {
        if (transaction == null) {
            return;
        }

        withNetworkSwitch(() => {
            sendTransaction(transaction, { onError: monitorError });
            setIsSubmitted(true);
        });
    }, [transaction, sendTransaction, monitorError, withNetworkSwitch]);

    const isPreparing = prepareStatus === 'pending';
    const isReady = prepareStatus === 'success';

    const steps: ITransactionStatusStep[] = [
        {
            id: ExecuteActionsStep.PREPARE,
            order: 0,
            meta: {
                label: t(
                    'app.governance.executeActionsDialog.step.prepare.label',
                ),
                errorLabel: t(
                    'app.governance.executeActionsDialog.step.prepare.errorLabel',
                ),
                state: prepareStatus,
            },
        },
        {
            id: ExecuteActionsStep.SUBMIT,
            order: 1,
            meta: {
                label: t(
                    'app.governance.executeActionsDialog.step.submit.label',
                ),
                errorLabel: t(
                    'app.governance.executeActionsDialog.step.submit.errorLabel',
                ),
                state: submitState,
                addon: {
                    label: t(
                        'app.governance.executeActionsDialog.step.submit.addon',
                    ),
                    icon: IconType.BLOCKCHAIN_WALLET,
                },
            },
        },
    ];

    const primaryAction = match({
        sendFailed,
        isSubmitted,
        prepareFailed: prepareStatus === 'error',
    })
        .with({ sendFailed: true }, () => ({
            label: t('app.shared.transactionDialog.footer.retry'),
            iconLeft: IconType.RELOAD,
            onClick: handleSend,
        }))
        .with({ isSubmitted: true }, () => ({
            label: t('app.governance.executeActionsDialog.button.success'),
            href: daoUtils.getDaoUrl(dao, 'transactions'),
            onClick: () => close(),
        }))
        .with({ prepareFailed: true }, () => ({
            label: t('app.shared.transactionDialog.footer.retry'),
            iconLeft: IconType.RELOAD,
            onClick: () => prepare(),
        }))
        .otherwise(() => ({
            label: t('app.governance.executeActionsDialog.button.submit'),
            onClick: handleSend,
            isLoading: isPreparing,
            disabled: !isReady,
        }));

    return (
        <>
            <Dialog.Header
                description={t(
                    'app.governance.executeActionsDialog.description',
                )}
                title={t('app.governance.executeActionsDialog.title')}
            />
            <Dialog.Content>
                <div className="flex flex-col gap-6 pb-3 md:pb-4">
                    <NetworkSwitchAlert
                        isCrossNetworkTransaction={isCrossNetworkTransaction}
                        networkName={networkName}
                    />
                    <TransactionStatus.Container steps={steps}>
                        {steps.map((step) => (
                            <TransactionStatus.Step key={step.id} {...step} />
                        ))}
                    </TransactionStatus.Container>
                </div>
            </Dialog.Content>
            <DialogFooter
                primaryAction={primaryAction}
                secondaryAction={{
                    label: t('app.shared.transactionDialog.footer.cancel'),
                    onClick: () => close(),
                    disabled: submitState === 'success',
                }}
            />
        </>
    );
};
