import type { IDialogComponentProps } from '@/shared/components/dialogProvider';
import {
    type ITransactionDialogStepMeta,
    TransactionDialog,
    TransactionDialogStep,
} from '@/shared/components/transactionDialog';
import { useTranslations } from '@/shared/components/translationsProvider';
import { useStepper } from '@/shared/hooks/useStepper';
import { useSupportedDaoPlugin } from '@/shared/hooks/useSupportedDaoPlugin';
import { DataList, invariant, ProposalDataListItem, type ProposalStatus } from '@aragon/ods';
import { useAccount } from 'wagmi';
import { executeDialogUtils } from './executeDialogUtils';

export interface IExecuteDialogParams {
    /**
     * ID of the DAO.
     */
    daoId: string;
    /**
     * The ID of the proposal.
     */
    proposalId: string;
    /**
     * The title of the proposal.
     */
    title: string;
    /**
     * The summary of the proposal.
     */
    summary: string;
    /**
     * The publisher.
     */
    publisher: string;
    /**
     * The status of the proposal.
     */
    status: ProposalStatus;
}

export interface IExecuteDialogProps extends IDialogComponentProps<IExecuteDialogParams> {}

export const ExecuteDialog: React.FC<IExecuteDialogProps> = (props) => {
    const { location } = props;

    invariant(location.params != null, 'ExecuteDialog: required parameters must be set.');

    const { address } = useAccount();
    invariant(address != null, 'ExecuteDialog: user must be connected.');

    const supportedPlugin = useSupportedDaoPlugin(location.params.daoId);
    invariant(supportedPlugin != null, 'ExecuteDialog: DAO has no supported plugin.');

    const { t } = useTranslations();

    const { daoId, proposalId, title, summary, publisher, status } = location.params;

    const stepper = useStepper<ITransactionDialogStepMeta, TransactionDialogStep>({
        initialActiveStep: TransactionDialogStep.PREPARE,
    });

    const handlePrepareTransaction = async () => {
        return executeDialogUtils.buildTransaction({ plugin: supportedPlugin, proposalId });
    };

    return (
        <TransactionDialog
            title={t('app.governance.executeDialog.title')}
            description={t('app.governance.executeDialog.description')}
            submitLabel={t('app.governance.executeDialog.buttons.submit')}
            successLink={{ label: t('app.governance.executeDialog.buttons.success'), href: `/dao/${daoId}/proposals` }}
            stepper={stepper}
            prepareTransaction={handlePrepareTransaction}
        >
            <DataList.Root entityLabel="">
                {/* @ts-expect-error TODO: update ODS component to remove type requirement (APP-3590) */}
                <ProposalDataListItem.Structure
                    title={title}
                    summary={summary}
                    publisher={{ address: publisher }}
                    status={status}
                />
            </DataList.Root>
        </TransactionDialog>
    );
};
