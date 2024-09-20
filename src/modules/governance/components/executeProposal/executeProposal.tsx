import { GovernanceDialogs } from '@/modules/governance/constants/moduleDialogs';
import type { IExecuteDialogParams } from '@/modules/governance/dialogs/executeDialog';
import { useDialogContext } from '@/shared/components/dialogProvider';
import { useTranslations } from '@/shared/components/translationsProvider';
import { Button, ChainEntityType, IconType, ProposalStatus, useBlockExplorer } from '@aragon/ods';

export interface IExecuteProposalProps {
    /**
     * The chain ID of the DAO.
     */
    chainId: number;
    /**
     * The transaction hash of the proposal.
     */
    transactionHash?: string;
    /**
     * The status of the proposal.
     */
    status: ProposalStatus;
    /**
     * The ID of the DAO.
     */
    daoId: string;
    /**
     * The incremental ID of the proposal.
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
     * Whether the execution failed.
     */
    executionFailed: boolean;
}

export const ExecuteProposal: React.FC<IExecuteProposalProps> = ({
    chainId,
    transactionHash,
    status,
    daoId,
    proposalId,
    title,
    summary,
    publisher,
    executionFailed,
}) => {
    const { t } = useTranslations();
    const { buildEntityUrl } = useBlockExplorer();
    const { open } = useDialogContext();

    const executedBlockLink = buildEntityUrl({
        type: ChainEntityType.TRANSACTION,
        id: transactionHash,
        chainId,
    });

    const openTransactionDialog = () => {
        const params: IExecuteDialogParams = {
            daoId,
            proposalId,
            title,
            summary,
            publisher,
            status,
        };
        open(GovernanceDialogs.EXECUTE, { params });
    };

    if (status !== ProposalStatus.EXECUTED && status !== ProposalStatus.EXECUTABLE) {
        return (
            <p className="text-sm leading-normal text-neutral-500">
                {t('app.governance.executeProposal.notExecutable')}
            </p>
        );
    }

    return (
        <div className="flex items-center gap-4">
            {executionFailed && (
                <>
                    <Button onClick={openTransactionDialog}>
                        {t('app.governance.executeProposal.buttons.tryAgain')}
                    </Button>
                    <Button
                        variant="secondary"
                        iconRight={IconType.LINK_EXTERNAL}
                        href={executedBlockLink}
                        target="_blank"
                    >
                        {t('app.governance.executeProposal.buttons.failed')}
                    </Button>
                </>
            )}
            {status === ProposalStatus.EXECUTED && (
                <Button variant="success" iconRight={IconType.LINK_EXTERNAL} href={executedBlockLink} target="_blank">
                    {t('app.governance.executeProposal.buttons.executed')}
                </Button>
            )}
            {status === ProposalStatus.EXECUTABLE && !executionFailed && (
                <Button onClick={openTransactionDialog}>{t('app.governance.executeProposal.buttons.execute')}</Button>
            )}
        </div>
    );
};
