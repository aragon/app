import {
    Button,
    ChainEntityType,
    type IButtonProps,
    IconType,
    ProposalStatus,
} from '@aragon/gov-ui-kit';
import type { IExecuteDialogParams } from '@/modules/governance/dialogs/executeDialog';
import { useDialogContext } from '@/shared/components/dialogProvider';
import { useTranslations } from '@/shared/components/translationsProvider';
import { useDaoChain } from '@/shared/hooks/useDaoChain';
import { useSlotSingleFunction } from '@/shared/hooks/useSlotSingleFunction';
import type { IProposal } from '../../api/governanceService';
import { GovernanceDialogId } from '../../constants/governanceDialogId';
import { GovernanceSlotId } from '../../constants/moduleSlots';
import { useProposalExecuteGuard } from '../../hooks/useProposalExecuteGuard';

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

export const ProposalExecutionStatus: React.FC<
    IProposalExecutionStatusProps
> = (props) => {
    const { daoId, proposal } = props;

    const { t } = useTranslations();
    const { open } = useDialogContext();

    const { network, pluginInterfaceType, executed } = proposal;
    const { buildEntityUrl } = useDaoChain({ network });

    const proposalStatus = useSlotSingleFunction<IProposal, ProposalStatus>({
        params: proposal,
        slotId: GovernanceSlotId.GOVERNANCE_PROCESS_PROPOSAL_STATUS,
        pluginId: pluginInterfaceType,
    })!;

    const executedBlockLink = buildEntityUrl({
        type: ChainEntityType.TRANSACTION,
        id: executed.transactionHash,
    });

    const openTransactionDialog = () => {
        const params: IExecuteDialogParams = {
            daoId,
            proposal,
            status: proposalStatus,
        };
        open(GovernanceDialogId.EXECUTE, { params });
    };

    const { check: checkProposalExecutePermission } = useProposalExecuteGuard({
        daoId,
        pluginAddress: proposal.pluginAddress,
        onSuccess: openTransactionDialog,
    });

    const buttonConfigs: Partial<Record<ProposalStatus, IButtonProps>> = {
        [ProposalStatus.EXECUTED]: {
            children: t(
                'app.governance.proposalExecutionStatus.buttons.executed',
            ),
            variant: 'success',
            iconRight: IconType.LINK_EXTERNAL,
            href: executedBlockLink,
            target: '_blank',
        },
        [ProposalStatus.EXECUTABLE]: {
            children: t(
                'app.governance.proposalExecutionStatus.buttons.execute',
            ),
            variant: 'primary',
            onClick: () => checkProposalExecutePermission(),
        },
    };

    const buttonConfig = buttonConfigs[proposalStatus];

    if (!buttonConfig) {
        return (
            <p className="text-neutral-500 text-sm leading-normal">
                {t('app.governance.proposalExecutionStatus.notExecutable')}
            </p>
        );
    }

    return <Button className="w-full md:w-fit" size="md" {...buttonConfig} />;
};
