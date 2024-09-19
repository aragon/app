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
    transactionHash: string;
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
}

type ButtonConfig = {
    text: string;
    variant?: 'primary' | 'secondary' | 'success';
    iconRight?: IconType;
    disabled?: boolean;
    onClick?: () => void;
    href?: string;
};

export const ExecuteProposal: React.FC<IExecuteProposalProps> = (props) => {
    const { chainId, transactionHash, status, daoId, proposalId, title, summary, publisher } = props;

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

    const buttonConfigs: Partial<Record<ProposalStatus, ButtonConfig>> = {
        [ProposalStatus.EXECUTED]: {
            text: t('app.governance.executeProposal.buttons.executed'),
            variant: 'success',
            iconRight: IconType.LINK_EXTERNAL,
            href: executedBlockLink,
        },
        [ProposalStatus.EXECUTABLE]: {
            text: t('app.governance.executeProposal.buttons.execute'),
            onClick: openTransactionDialog,
        },
    };

    const config = buttonConfigs[status];

    if (!config) {
        return (
            <Button target="_blank" className="w-fit" size="md" variant="secondary" disabled={true}>
                {t('app.governance.executeProposal.buttons.execute')}
            </Button>
        );
    }

    return (
        <Button target="_blank" className="w-fit" size="md" {...config}>
            {config.text}
        </Button>
    );
};
