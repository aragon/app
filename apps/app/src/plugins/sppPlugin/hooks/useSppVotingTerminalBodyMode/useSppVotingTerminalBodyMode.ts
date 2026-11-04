import { externalPluginId } from '@/plugins/safeMultisigPlugin/constants';
import {
    SafeSettledReportOutcome,
    useSafeSettledReport,
} from '@/plugins/safeMultisigPlugin/hooks/useSafeSettledReport';
import { safeMultisigProposalUtils } from '@/plugins/safeMultisigPlugin/utils/safeMultisigProposalUtils';
import { PluginInterfaceType } from '@/shared/api/daoService';
import { useSafeInfo } from '@/shared/api/safeService';
import { SppProposalType } from '../../types';
import { sppStageUtils } from '../../utils/sppStageUtils';
import type {
    IUseSppVotingTerminalBodyModeParams,
    IUseSppVotingTerminalBodyModeReturn,
} from './useSppVotingTerminalBodyMode.api';

/** Resolves one rendering mode for every slot of a stage body. */
export const useSppVotingTerminalBodyMode = (
    params: IUseSppVotingTerminalBodyModeParams,
): IUseSppVotingTerminalBodyModeReturn => {
    const { plugin, proposal, stage } = params;
    const registeredPluginId = sppStageUtils.getBodyPluginId(
        plugin,
        proposal.network,
    );
    const isSafe = registeredPluginId === PluginInterfaceType.SAFE;
    const { data: safeInfo } = useSafeInfo(
        { urlParams: { network: proposal.network, address: plugin.address } },
        { enabled: isSafe },
    );
    const isUnsupportedSafe =
        isSafe &&
        safeInfo?.version != null &&
        !safeMultisigProposalUtils.supportsEip1271Signatures(safeInfo.version);
    const bodyResult = sppStageUtils.getBodyResult(
        proposal,
        plugin.address,
        stage.stageIndex,
    );
    const { outcome, isError, isLoading } = useSafeSettledReport({
        network: proposal.network,
        address: plugin.address,
        pluginAddress: proposal.pluginAddress,
        proposalId: BigInt(proposal.proposalIndex),
        stageId: stage.stageIndex,
        resultType: bodyResult?.resultType ?? SppProposalType.NONE,
        enabled: isSafe && !isUnsupportedSafe && bodyResult != null,
    });
    const isHistoryMissing =
        isSafe &&
        !isUnsupportedSafe &&
        bodyResult != null &&
        !isError &&
        !isLoading &&
        (outcome === SafeSettledReportOutcome.NOT_REPORTED ||
            outcome === SafeSettledReportOutcome.SCAN_EXHAUSTED);

    return {
        pluginId:
            isUnsupportedSafe || isHistoryMissing
                ? externalPluginId
                : registeredPluginId,
        isHistoryMissing,
    };
};
