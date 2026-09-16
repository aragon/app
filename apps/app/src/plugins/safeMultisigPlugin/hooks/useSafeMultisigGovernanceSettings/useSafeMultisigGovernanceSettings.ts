'use client';

import { addressUtils, type IDefinitionSetting } from '@aragon/gov-ui-kit';
import {
    safeAppAccountUrl,
    safeShortNameFromNetwork,
} from '@/modules/application/utils/proxySafeUtils/safeTxServiceNetworks';
import { useEnsName } from '@/modules/ens';
import type { IUseGovernanceSettingsParams } from '@/modules/settings/types';
import { SppProposalType } from '@/plugins/sppPlugin/types';
import { sppStageUtils } from '@/plugins/sppPlugin/utils/sppStageUtils';
import { useSafeInfo } from '@/shared/api/safeService';
import { useTranslations } from '@/shared/components/translationsProvider';
import { daoUtils } from '@/shared/utils/daoUtils';
import { safeMultisigSettingsUtils } from '../../utils/safeMultisigSettingsUtils';
import {
    SafeSettledReportOutcome,
    useSafeSettledReport,
} from '../useSafeSettledReport';

export const useSafeMultisigGovernanceSettings = (
    params: IUseGovernanceSettingsParams,
): IDefinitionSetting[] => {
    const { daoId, pluginAddress, proposal, stage } = params;
    const { t } = useTranslations();
    const { network } = daoUtils.parseDaoId(daoId);
    const { data: safeInfo } = useSafeInfo({
        urlParams: { network, address: pluginAddress },
    });
    const { data: ensName } = useEnsName(pluginAddress);

    /**
     * A native body's settings are snapshotted onto its sub-proposal at creation, so its Settings
     * tab states what the decision ran under. A Safe's are only readable live, so a settled body
     * has to recover them from the transaction that reported its verdict - otherwise this tab
     * describes the Safe as it stands today, years after the decision it is filed under.
     */
    const bodyResult =
        proposal == null || stage == null
            ? undefined
            : sppStageUtils.getBodyResult(
                  proposal,
                  pluginAddress,
                  stage.stageIndex,
              );
    const isSettled = bodyResult != null;

    /**
     * Whether this body's say is over. A veto body that never vetoed leaves no transaction to
     * recover, so settledness alone would leave it reading live Safe state forever. Only an
     * elapsed stage counts, and nothing else: a body on a stage the proposal has not reached yet
     * has done nothing, and the live account is still what would apply to it.
     */
    const isDecided =
        proposal != null &&
        stage != null &&
        (isSettled ||
            stage.stageIndex < proposal.stageIndex ||
            proposal.executed.status);

    const { settledReport, outcome: settledReportOutcome } =
        useSafeSettledReport({
            network,
            address: pluginAddress,
            // Unused while the scan is off, and the gate below is the only thing that turns it on.
            pluginAddress: proposal?.pluginAddress ?? pluginAddress,
            proposalId: BigInt(proposal?.proposalIndex ?? 0),
            stageId: stage?.stageIndex ?? 0,
            resultType: bodyResult?.resultType ?? SppProposalType.NONE,
            enabled: isSettled && safeShortNameFromNetwork(network) != null,
        });

    if (safeInfo == null) {
        return [];
    }

    return safeMultisigSettingsUtils.parseSettings({
        safeInfo,
        address: safeInfo.address,
        version: safeInfo.version,
        safeName: ensName ?? addressUtils.truncateAddress(pluginAddress),
        safeHref: safeAppAccountUrl({ network, address: pluginAddress }),
        isDecided,
        settledTransaction: settledReport?.transaction,
        isScanExhausted:
            settledReportOutcome === SafeSettledReportOutcome.SCAN_EXHAUSTED,
        t,
    });
};
