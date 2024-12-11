import { GovernanceDialog } from '@/modules/governance/constants/moduleDialogs';
import type { IExecuteDialogParams } from '@/modules/governance/dialogs/executeDialog';
import { useDialogContext } from '@/shared/components/dialogProvider';
import { useTranslations } from '@/shared/components/translationsProvider';
import { networkDefinitions } from '@/shared/constants/networkDefinitions';
import { useSlotSingleFunction } from '@/shared/hooks/useSlotSingleFunction';
import {
    Button,
    ChainEntityType,
    type IButtonProps,
    IconType,
    ProposalStatus,
    useBlockExplorer,
} from '@aragon/gov-ui-kit';
import type { IProposal } from '../../api/governanceService';
import { GovernanceSlotId } from '../../constants/moduleSlots';

export interface IProposalExecutionStatusProps {
    /**
     * The ID of the DAO.
     */
    daoId: string;
    /**
     * The proposal to be executed.
     */
    proposal: IProposal;
}

export const ProposalExecutionStatus: React.FC<IProposalExecutionStatusProps> = (props) => {
    const { daoId, proposal } = props;

    const { t } = useTranslations();
    const { buildEntityUrl } = useBlockExplorer();
    const { open } = useDialogContext();

    const { network, pluginSubdomain, executed } = proposal;
    const { chainId } = networkDefinitions[network];

    const proposalStatus = useSlotSingleFunction<IProposal, ProposalStatus>({
        params: proposal,
        slotId: GovernanceSlotId.GOVERNANCE_PROCESS_PROPOSAL_STATUS,
        pluginId: pluginSubdomain,
    })!;

    const executedBlockLink = buildEntityUrl({
        type: ChainEntityType.TRANSACTION,
        id: executed.transactionHash,
        chainId,
    });

    const openTransactionDialog = () => {
        const params: IExecuteDialogParams = { daoId, proposal, status: proposalStatus };
        open(GovernanceDialog.EXECUTE, { params });
    };

    const buttonConfigs: Partial<Record<ProposalStatus, IButtonProps>> = {
        [ProposalStatus.EXECUTED]: {
            children: t('app.governance.proposalExecutionStatus.buttons.executed'),
            variant: 'success',
            iconRight: IconType.LINK_EXTERNAL,
            href: executedBlockLink,
            target: '_blank',
        },
        [ProposalStatus.EXECUTABLE]: {
            children: t('app.governance.proposalExecutionStatus.buttons.execute'),
            variant: 'primary',
            onClick: openTransactionDialog,
        },
    };

    const buttonConfig = buttonConfigs[proposalStatus];

    if (!buttonConfig) {
        return (
            <p className="text-sm leading-normal text-neutral-500">
                {t('app.governance.proposalExecutionStatus.notExecutable')}
            </p>
        );
    }

    return <Button className="w-full md:w-fit" size="md" {...buttonConfig} />;
};
