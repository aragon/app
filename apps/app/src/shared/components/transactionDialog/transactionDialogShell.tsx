import { AlertCard, Dialog } from '@aragon/gov-ui-kit';
import type { ReactNode } from 'react';
import { NetworkSwitchAlert } from '../networkSwitchAlert';
import { type ITransactionInfo, TransactionStatus } from '../transactionStatus';
import { useTranslations } from '../translationsProvider';
import type { ITransactionDialogStep } from './transactionDialog.api';

interface ITransactionDialogShellProps<TStepId extends string = string> {
    title: string;
    description: string;
    isCrossNetworkTransaction: boolean;
    networkName: string;
    showConfirmWarning?: boolean;
    showStatus?: boolean;
    children?: ReactNode;
    steps: ITransactionDialogStep<TStepId>[];
    transactionInfo?: ITransactionInfo;
    footer: ReactNode;
    statusBeforeChildren?: boolean;
}

export const TransactionDialogShell = <TStepId extends string>(
    props: ITransactionDialogShellProps<TStepId>,
) => {
    const {
        title,
        description,
        isCrossNetworkTransaction,
        networkName,
        showConfirmWarning = false,
        showStatus = true,
        statusBeforeChildren = false,
        children,
        steps,
        transactionInfo,
        footer,
    } = props;
    const { t } = useTranslations();
    const status =
        steps.length === 0 ? null : (
            <TransactionStatus.Container
                steps={steps}
                transactionInfo={transactionInfo}
            >
                {steps.map((step) => (
                    <TransactionStatus.Step key={step.id} {...step} />
                ))}
            </TransactionStatus.Container>
        );

    return (
        <>
            <Dialog.Header description={description} title={title} />
            <Dialog.Content>
                <div className="flex flex-col gap-6 pb-3 md:pb-4">
                    <NetworkSwitchAlert
                        isCrossNetworkTransaction={isCrossNetworkTransaction}
                        networkName={networkName}
                    />
                    {showConfirmWarning && (
                        <AlertCard
                            message={t(
                                'app.shared.transactionDialog.confirmWarning.title',
                            )}
                            variant="warning"
                        >
                            {t(
                                'app.shared.transactionDialog.confirmWarning.description',
                            )}
                        </AlertCard>
                    )}
                    {showStatus && statusBeforeChildren && status}
                    {children}
                    {showStatus && !statusBeforeChildren && status}
                </div>
            </Dialog.Content>
            {footer}
        </>
    );
};
