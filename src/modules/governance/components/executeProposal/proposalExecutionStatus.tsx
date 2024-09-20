import { GovernanceDialogs } from '@/modules/governance/constants/moduleDialogs';
import type { IExecuteDialogParams } from '@/modules/governance/dialogs/executeDialog';
import { useDialogContext } from '@/shared/components/dialogProvider';
import { useTranslations } from '@/shared/components/translationsProvider';
import { networkDefinitions } from '@/shared/constants/networkDefinitions';
import { useDaoPluginIds } from '@/shared/hooks/useDaoPluginIds';
import { useSlotFunction } from '@/shared/hooks/useSlotFunction';
import { Button, ChainEntityType, IconType, ProposalStatus, useBlockExplorer } from '@aragon/ods';
import type { IProposal } from '../../api/governanceService';
import { GovernanceSlotId } from '../../constants/moduleSlots';

export interface IExecuteProposalProps {
    /**
     * The ID of the DAO.
     */
    daoId: string;
    /**
     * TThe proposal to be executed.
     */
    proposal: IProposal;
}

export const ProposalExecutionStatus: React.FC<IExecuteProposalProps> = ({ daoId, proposal }) => {
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

    if (proposalStatus !== ProposalStatus.EXECUTED && proposalStatus !== ProposalStatus.EXECUTABLE) {
        return (
            <p className="text-sm leading-normal text-neutral-500">
                {t('app.governance.proposalExecutionStatus.notExecutable')}
            </p>
        );
    }

    const executionFailed = Boolean(proposal.executed.transactionHash && !proposal.executed.status);

    return (
        <div className="flex items-center gap-4">
            {executionFailed && (
                <>
                    <Button onClick={openTransactionDialog}>
                        {t('app.governance.proposalExecutionStatus.buttons.tryAgain')}
                    </Button>
                    <Button
                        variant="secondary"
                        iconRight={IconType.LINK_EXTERNAL}
                        href={executedBlockLink}
                        target="_blank"
                    >
                        {t('app.governance.proposalExecutionStatus.buttons.failed')}
                    </Button>
                </>
            )}
            {proposalStatus === ProposalStatus.EXECUTED && (
                <Button variant="success" iconRight={IconType.LINK_EXTERNAL} href={executedBlockLink} target="_blank">
                    {t('app.governance.proposalExecutionStatus.buttons.executed')}
                </Button>
            )}
            {proposalStatus === ProposalStatus.EXECUTABLE && !executionFailed && (
                <Button onClick={openTransactionDialog}>
                    {t('app.governance.proposalExecutionStatus.buttons.execute')}
                </Button>
            )}
        </div>
    );
};
