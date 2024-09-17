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
import { voteOnProposalDialogUtils } from './voteOnProposalDialogUtils';
import { useCallback, useEffect } from 'react';

export interface IVoteOnProposalDialogParams {
    /**
     * ID of the DAO to create the proposal for.
     */
    daoId: string;
    /**
     * Values
     */
    values: { voteOption: string; title: string; summary: string; proposalId: string };
}

export interface IVoteOnProposalDialogProps extends IDialogComponentProps<IVoteOnProposalDialogParams> {}

export const VoteOnProposalDialog: React.FC<IVoteOnProposalDialogProps> = (props) => {
    const { t } = useTranslations();

    const { location } = props;

    invariant(location.params != null, 'VoteOnProposalDialog: required parameters must be set.');

    const { address } = useAccount();
    invariant(address != null, 'VoteOnProposalDialog: user must be connected.');

    const supportedPlugin = useSupportedDaoPlugin(location.params.daoId);
    invariant(supportedPlugin != null, 'VoteOnProposalDialog: DAO has no supported plugin.');

    const { values } = location.params;
    const { proposalId, title, voteOption } = values;
    const stepper = useStepper<ITransactionDialogStepMeta, TransactionDialogStep>({
        initialActiveStep: TransactionDialogStep.PREPARE,
    });

    // const handlePrepareTransaction = () => {
    //     return voteOnProposalDialogUtils.buildTransaction({ values, plugin: supportedPlugin });
    // };

    const handlePrepareTransaction = useCallback(() => {
        return voteOnProposalDialogUtils.buildTransaction({ values, plugin: supportedPlugin });
    }, [values, supportedPlugin]);

    useEffect(() => {
        console.log(values);
    }, [values]);

    return (
        <TransactionDialog
            title={t('app.governance.voteOnProposalDialog.title')}
            description={t('app.governance.voteOnProposalDialog.description')}
            submitLabel={t('app.governance.voteOnProposalDialog.button.submit')}
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
