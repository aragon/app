import type { IDialogComponentProps } from '@/shared/components/dialogProvider';
import {
    type ITransactionDialogStepMeta,
    TransactionDialog,
    TransactionDialogStep,
} from '@/shared/components/transactionDialog';
import { useTranslations } from '@/shared/components/translationsProvider';
import { useStepper } from '@/shared/hooks/useStepper';
import { useSupportedDaoPlugin } from '@/shared/hooks/useSupportedDaoPlugin';
import { DataList, invariant, VoteProposalDataListItemStructure } from '@aragon/ods';
import { useAccount } from 'wagmi';
import type { IVoteDialogParams } from './voteDialog.api';
import { voteDialogUtils } from './voteDialogUtils';

export interface IVoteDialogProps extends IDialogComponentProps<IVoteDialogParams> {}

export const VoteDialog: React.FC<IVoteDialogProps> = (props) => {
    const { t } = useTranslations();

    const { location } = props;

    invariant(location.params != null, 'VoteDialog: required parameters must be set.');

    const { address } = useAccount();
    invariant(address != null, 'VoteDialog: user must be connected.');

    const supportedPlugin = useSupportedDaoPlugin(location.params.daoId);
    invariant(supportedPlugin != null, 'VoteDialog: DAO has no supported plugin.');

    const { values, daoId } = location.params;
    const { title, voteOption, summary } = values;

    const stepper = useStepper<ITransactionDialogStepMeta, TransactionDialogStep>({
        initialActiveStep: TransactionDialogStep.PREPARE,
    });

    const handlePrepareTransaction = () => {
        return voteDialogUtils.buildTransaction({ values, plugin: supportedPlugin });
    };

    return (
        <TransactionDialog
            title={t('app.governance.voteDialog.title')}
            description={t('app.governance.voteDialog.description')}
            submitLabel={t('app.governance.voteDialog.button.submit')}
            successLink={{ label: t('app.governance.voteDialog.button.success'), href: `/dao/${daoId}/proposals` }}
            stepper={stepper}
            prepareTransaction={handlePrepareTransaction}
        >
            <DataList.Root entityLabel="">
                <DataList.Container>
                    <VoteProposalDataListItemStructure
                        proposalId={title}
                        proposalTitle={summary}
                        voteIndicator={voteOption === '2' ? 'yes' : voteOption === '1' ? 'abstain' : 'no'}
                        // TODO: Make date field optional
                        date={0}
                    />
                </DataList.Container>
            </DataList.Root>
        </TransactionDialog>
    );
};
