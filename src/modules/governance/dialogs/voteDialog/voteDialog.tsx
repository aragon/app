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
import { useCallback, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { voteDialogUtils } from './voteDialogUtils';

export interface IVoteDialogParams {
    /**
     * ID of the DAO to create the proposal for.
     */
    daoId: string;
    /**
     * Values
     */
    values: { voteOption: string; title: string; summary: string; proposalId: string };
}

export interface IVoteDialogProps extends IDialogComponentProps<IVoteDialogParams> {}

export const VoteDialog: React.FC<IVoteDialogProps> = (props) => {
    const { t } = useTranslations();

    const { location } = props;

    invariant(location.params != null, 'VoteDialog: required parameters must be set.');

    const { address } = useAccount();
    invariant(address != null, 'VoteDialog: user must be connected.');

    const supportedPlugin = useSupportedDaoPlugin(location.params.daoId);
    invariant(supportedPlugin != null, 'VoteDialog: DAO has no supported plugin.');

    const { values } = location.params;
    const { proposalId, title, voteOption } = values;
    const stepper = useStepper<ITransactionDialogStepMeta, TransactionDialogStep>({
        initialActiveStep: TransactionDialogStep.PREPARE,
    });

    // const handlePrepareTransaction = () => {
    //     return voteDialogUtils.buildTransaction({ values, plugin: supportedPlugin });
    // };

    const handlePrepareTransaction = useCallback(() => {
        return voteDialogUtils.buildTransaction({ values, plugin: supportedPlugin });
    }, [values, supportedPlugin]);

    useEffect(() => {
        console.log(values);
    }, [values]);

    return (
        <TransactionDialog
            title={t('app.governance.voteDialog.title')}
            description={t('app.governance.voteDialog.description')}
            submitLabel={t('app.governance.voteDialog.button.submit')}
            successLink={{ label: 'View vote', href: '/governance/proposal/1' }}
            stepper={stepper}
            prepareTransaction={handlePrepareTransaction}
        >
            <DataList.Root entityLabel="">
                <DataList.Container>
                    <VoteProposalDataListItemStructure
                        proposalId={proposalId}
                        proposalTitle={title}
                        voteIndicator={voteOption === '2' ? 'yes' : voteOption === '1' ? 'abstain' : 'no'}
                        date={0}
                    />
                </DataList.Container>
            </DataList.Root>
        </TransactionDialog>
    );
};
