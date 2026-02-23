import {
    DataList,
    invariant,
    ProposalDataListItem,
    type ProposalStatus,
} from '@aragon/gov-ui-kit';
import { useRouter } from 'next/navigation';
import { useConnection } from 'wagmi';
import { useDao } from '@/shared/api/daoService';
import { TransactionType } from '@/shared/api/transactionService';
import type { IDialogComponentProps } from '@/shared/components/dialogProvider';
import {
    type ITransactionDialogStepMeta,
    TransactionDialog,
    TransactionDialogStep,
} from '@/shared/components/transactionDialog';
import { useTranslations } from '@/shared/components/translationsProvider';
import { useStepper } from '@/shared/hooks/useStepper';
import { daoUtils } from '@/shared/utils/daoUtils';
import type { IProposal } from '../../api/governanceService';
import { proposalUtils } from '../../utils/proposalUtils';
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

export interface IExecuteDialogProps
    extends IDialogComponentProps<IExecuteDialogParams> {}

export const ExecuteDialog: React.FC<IExecuteDialogProps> = (props) => {
    const { location } = props;

    const router = useRouter();

    invariant(
        location.params != null,
        'ExecuteDialog: required parameters must be set.',
    );

    const { address } = useConnection();
    invariant(address != null, 'ExecuteDialog: user must be connected.');

    const { t } = useTranslations();

    const { proposal, status, daoId } = location.params;
    const { title, summary, creator, proposalIndex, pluginAddress, network } =
        proposal;

    const { data: dao } = useDao({ urlParams: { id: daoId } });

    const stepper = useStepper<
        ITransactionDialogStepMeta,
        TransactionDialogStep
    >({
        initialActiveStep: TransactionDialogStep.PREPARE,
    });

    const handlePrepareTransaction = () =>
        executeDialogUtils.buildTransaction({ pluginAddress, proposalIndex });

    const slug = proposalUtils.getProposalSlug(proposal, dao);

    return (
        <TransactionDialog
            description={t('app.governance.executeDialog.description')}
            indexingFallbackUrl={daoUtils.getDaoUrl(dao, `proposals/${slug}`)}
            network={network}
            prepareTransaction={handlePrepareTransaction}
            stepper={stepper}
            submitLabel={t('app.governance.executeDialog.buttons.submit')}
            successLink={{
                label: t('app.governance.executeDialog.buttons.success'),
                onClick: () => router.refresh(),
            }}
            title={t('app.governance.executeDialog.title')}
            transactionType={TransactionType.PROPOSAL_EXECUTE}
        >
            <DataList.Root entityLabel="">
                <ProposalDataListItem.Structure
                    id={slug}
                    publisher={{ address: creator.address }}
                    status={status}
                    summary={summary}
                    title={title}
                />
            </DataList.Root>
        </TransactionDialog>
    );
};
