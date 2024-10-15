import type { IDialogComponentProps } from '@/shared/components/dialogProvider';
import {
    type ITransactionDialogStepMeta,
    TransactionDialog,
    TransactionDialogStep,
} from '@/shared/components/transactionDialog';
import { useTranslations } from '@/shared/components/translationsProvider';
import { useStepper } from '@/shared/hooks/useStepper';
import { DataList, invariant, ProposalDataListItem, type ProposalStatus } from '@aragon/ods';
import { useRouter } from 'next/navigation';
import { useAccount } from 'wagmi';
import type { IProposal } from '../../api/governanceService';
import { executeDialogUtils } from './executeDialogUtils';

export interface IExecuteDialogParams {
    /**
     * The ID of the DAO.
     */
    daoId: string;
    /**
     * The proposal to be executed.
     */
    proposal: IProposal;
    /**
     * The status of the proposal.
     */
    status: ProposalStatus;
}

export interface IExecuteDialogProps extends IDialogComponentProps<IExecuteDialogParams> {}

export const ExecuteDialog: React.FC<IExecuteDialogProps> = (props) => {
    const { location } = props;

    const router = useRouter();

    invariant(location.params != null, 'ExecuteDialog: required parameters must be set.');

    const { address } = useAccount();
    invariant(address != null, 'ExecuteDialog: user must be connected.');

    const { t } = useTranslations();

    const { proposal, status } = location.params;
    const { title, summary, creator, proposalIndex, pluginAddress } = proposal;

    const stepper = useStepper<ITransactionDialogStepMeta, TransactionDialogStep>({
        initialActiveStep: TransactionDialogStep.PREPARE,
    });

    const handlePrepareTransaction = async () => {
        return executeDialogUtils.buildTransaction({ pluginAddress, proposalIndex });
    };

    return (
        <TransactionDialog
            title={t('app.governance.executeDialog.title')}
            description={t('app.governance.executeDialog.description')}
            submitLabel={t('app.governance.executeDialog.buttons.submit')}
            successLink={{
                label: t('app.governance.executeDialog.buttons.success'),
                action: () => router.refresh(),
            }}
            stepper={stepper}
            prepareTransaction={handlePrepareTransaction}
        >
            <DataList.Root entityLabel="">
                <ProposalDataListItem.Structure
                    title={title}
                    summary={summary}
                    publisher={{ address: creator.address }}
                    status={status}
                />
            </DataList.Root>
        </TransactionDialog>
    );
};
