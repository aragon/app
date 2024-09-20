import { GovernanceDialogs } from '@/modules/governance/constants/moduleDialogs';
import type { IExecuteDialogParams } from '@/modules/governance/dialogs/executeDialog';
import { useDialogContext } from '@/shared/components/dialogProvider';
import { useTranslations } from '@/shared/components/translationsProvider';
import { networkDefinitions } from '@/shared/constants/networkDefinitions';
import { useDaoPluginIds } from '@/shared/hooks/useDaoPluginIds';
import { useSlotFunction } from '@/shared/hooks/useSlotFunction';
import { Button, type ButtonVariant, ChainEntityType, IconType, ProposalStatus, useBlockExplorer } from '@aragon/ods';
import type { IProposal } from '../../api/governanceService';
import { GovernanceSlotId } from '../../constants/moduleSlots';

type ButtonConfig = {
    text: string;
    variant?: ButtonVariant;
    iconRight?: IconType;
    disabled?: boolean;
    onClick?: () => void;
    href?: string;
    target?: string;
};

export interface IExecuteProposalProps {
    /**
     * The ID of the DAO.
     */
    daoId: string;
    /**
     * The proposal to be executed.
     */
    proposal: IProposal;
}

export const ProposalExecutionStatus: React.FC<IExecuteProposalProps> = (props) => {
    const { daoId, proposal } = props;
    const { t } = useTranslations();
    const { buildEntityUrl } = useBlockExplorer();
    const { open } = useDialogContext();
    const { chainId } = networkDefinitions[proposal.network];
    const pluginIds = useDaoPluginIds(daoId);

    const proposalStatus = useSlotFunction<ProposalStatus>({
        params: proposal,
        slotId: GovernanceSlotId.GOVERNANCE_PROCESS_PROPOSAL_STATUS,
        pluginIds,
    })!;

    const { transactionHash } = proposal;

    const executedBlockLink = buildEntityUrl({
        type: ChainEntityType.TRANSACTION,
        id: transactionHash,
        chainId,
    });

    const openTransactionDialog = () => {
        const params: IExecuteDialogParams = {
            daoId,
            proposal,
            status: proposalStatus,
        };
        open(GovernanceDialogs.EXECUTE, { params });
    };

    const buttonConfigs: Partial<Record<ProposalStatus, ButtonConfig>> = {
        [ProposalStatus.EXECUTED]: {
            text: t('app.governance.proposalExecutionStatus.buttons.executed'),
            variant: 'success',
            iconRight: IconType.LINK_EXTERNAL,
            href: executedBlockLink,
            target: '_blank',
        },
        [ProposalStatus.EXECUTABLE]: {
            text: t('app.governance.proposalExecutionStatus.buttons.execute'),
            variant: 'primary',
            onClick: openTransactionDialog,
        },
    };

    const config = buttonConfigs[proposalStatus];

    if (!config) {
        return (
            <p className="text-sm leading-normal text-neutral-500">
                {t('app.governance.proposalExecutionStatus.notExecutable')}
            </p>
        );
    }

    return (
        <Button className="w-full md:w-fit" {...config}>
            {config.text}
        </Button>
    );
};
