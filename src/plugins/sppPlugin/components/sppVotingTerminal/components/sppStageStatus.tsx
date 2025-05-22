import { useConnectedWalletGuard } from '@/modules/application/hooks/useConnectedWalletGuard';
import { SppPluginDialogId } from '@/plugins/sppPlugin/constants/sppPluginDialogId';
import { type ISppAdvanceStageDialogParams } from '@/plugins/sppPlugin/dialogs/sppAdvanceStageDialog';
import { type ISppProposal, type ISppStage } from '@/plugins/sppPlugin/types';
import { sppStageUtils } from '@/plugins/sppPlugin/utils/sppStageUtils';
import { useDialogContext } from '@/shared/components/dialogProvider';
import { useTranslations } from '@/shared/components/translationsProvider';
import { networkDefinitions } from '@/shared/constants/networkDefinitions';
import { useDynamicValue } from '@/shared/hooks/useDynamicValue';
import { Button, ChainEntityType, IconType, ProposalStatus, useBlockExplorer } from '@aragon/gov-ui-kit';
import { DateTime } from 'luxon';

export interface ISppStageStatusProps {
    /**
     * SPP main proposal.
     */
    proposal: ISppProposal;
    /**
     * Stage to display the status for.
     */
    stage: ISppStage;
    /**
     * ID of the DAO related to the proposal.
     */
    daoId: string;
}

export const SppStageStatus: React.FC<ISppStageStatusProps> = (props) => {
    const { proposal, daoId, stage } = props;

    const { t } = useTranslations();
    const { open } = useDialogContext();

    const { id: chainId } = networkDefinitions[proposal.network];
    const { buildEntityUrl } = useBlockExplorer({ chainId });

    const openAdvanceStageDialog = () => {
        const params: ISppAdvanceStageDialogParams = { daoId, proposal };
        open(SppPluginDialogId.ADVANCE_STAGE, { params });
    };

    const { check: promptWalletConnection, result: isConnected } = useConnectedWalletGuard({
        onSuccess: openAdvanceStageDialog,
    });

    const stageStatus = sppStageUtils.getStageStatus(proposal, stage);
    const isStageAdvanced = stage.stageIndex < proposal.stageIndex || proposal.executed.status;

    const execution = proposal.stageExecutions.find((execution) => execution.stageIndex === stage.stageIndex);
    const advanceTransactionHref = buildEntityUrl({
        type: ChainEntityType.TRANSACTION,
        id: execution?.transactionHash,
    });

    const isLastStage = sppStageUtils.isLastStage(proposal, stage);

    // Display button when status is advanceable except for the last stage.
    const displayAdvanceButton = stageStatus === ProposalStatus.ADVANCEABLE && !isLastStage;

    const minAdvanceTime = sppStageUtils.getStageMinAdvance(proposal, stage);

    const canAdvance = useDynamicValue({
        callback: () => DateTime.now() >= minAdvanceTime!,
        enabled: displayAdvanceButton && minAdvanceTime != null,
    });

    const { label: buttonLabel, ...buttonProps } = isStageAdvanced
        ? {
              label: 'advanced',
              href: advanceTransactionHref,
              target: '_blank',
              variant: 'secondary' as const,
              iconRight: IconType.LINK_EXTERNAL,
          }
        : {
              label: 'advance',
              onClick: () => (isConnected ? openAdvanceStageDialog() : promptWalletConnection()),
              variant: 'primary' as const,
              disabled: !canAdvance,
          };

    const advanceTimeContext = isLastStage ? 'Execute' : 'Advance';

    // Stage cannot be advanced anymore, display expired info text.
    if (stageStatus === ProposalStatus.EXPIRED) {
        return (
            <span className="text-right text-neutral-500">
                {t(`app.plugins.spp.sppStageStatus.expired${advanceTimeContext}`)}
            </span>
        );
    }

    if (!displayAdvanceButton) {
        return null;
    }

    return (
        <Button className="w-full md:w-fit" size="md" {...buttonProps}>
            {t(`app.plugins.spp.sppStageStatus.button.${buttonLabel}`)}
        </Button>
    );
};
