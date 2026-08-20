import { AlertCard, addressUtils } from '@aragon/gov-ui-kit';
import { useTranslations } from '@/shared/components/translationsProvider';
import type { IWorkspaceDetails } from '../../api/workspaceService';
import type { IWorkspaceAccount } from '../../types';
import { workspaceUtils } from '../../utils/workspaceUtils';

export interface IWorkspaceSignalsProps {
    /**
     * Workspace to display the signals of.
     */
    workspace: IWorkspaceDetails;
    /**
     * Accounts of the workspace, sorted by the number of capabilities they control.
     */
    accounts: IWorkspaceAccount[];
}

/**
 * Share of the workspace capabilities a single account must control to be flagged as a concentration
 * risk.
 */
const concentrationThreshold = 50;

export const WorkspaceSignals: React.FC<IWorkspaceSignalsProps> = (props) => {
    const { workspace, accounts } = props;

    const { t } = useTranslations();

    const signals = workspaceUtils.getSignals(workspace);
    const topAccount = accounts[0];
    const totalCapabilities = workspace.counts.capabilities;
    const topAccountShare =
        topAccount != null && totalCapabilities > 0
            ? Math.round((topAccount.capabilityCount / totalCapabilities) * 100)
            : 0;
    const hasConcentration = topAccountShare >= concentrationThreshold;

    const hasSignals =
        hasConcentration ||
        signals.externalAccounts.length > 0 ||
        signals.pendingOwnerTargets.length > 0 ||
        signals.unclaimedGateTargets.length > 0 ||
        signals.delegatedAuthorityTargets.length > 0 ||
        signals.failedTargets.length > 0 ||
        signals.inferredGateCount > 0;

    if (!hasSignals) {
        return (
            <p className="text-neutral-500 text-sm">
                {t('app.workspace.workspaceSignals.none')}
            </p>
        );
    }

    return (
        <div className="flex flex-col gap-3">
            {signals.externalAccounts.length > 0 && (
                <AlertCard
                    message={t('app.workspace.workspaceSignals.external', {
                        count: signals.externalAccounts.length,
                    })}
                    variant="critical"
                >
                    {signals.externalAccounts
                        .map(addressUtils.truncateAddress)
                        .join(', ')}
                </AlertCard>
            )}
            {hasConcentration && (
                <AlertCard
                    message={t('app.workspace.workspaceSignals.concentration', {
                        share: topAccountShare,
                    })}
                    variant="warning"
                >
                    {addressUtils.truncateAddress(topAccount.address)}
                </AlertCard>
            )}
            {signals.pendingOwnerTargets.length > 0 && (
                <AlertCard
                    message={t('app.workspace.workspaceSignals.pendingOwner', {
                        count: signals.pendingOwnerTargets.length,
                    })}
                    variant="warning"
                >
                    {signals.pendingOwnerTargets
                        .map(addressUtils.truncateAddress)
                        .join(', ')}
                </AlertCard>
            )}
            {signals.unclaimedGateTargets.length > 0 && (
                <AlertCard
                    message={t('app.workspace.workspaceSignals.unclaimed', {
                        count: signals.unclaimedGateTargets.length,
                    })}
                    variant="warning"
                >
                    {signals.unclaimedGateTargets
                        .map(addressUtils.truncateAddress)
                        .join(', ')}
                </AlertCard>
            )}
            {signals.delegatedAuthorityTargets.length > 0 && (
                <AlertCard
                    message={t('app.workspace.workspaceSignals.authority', {
                        count: signals.delegatedAuthorityTargets.length,
                    })}
                    variant="info"
                >
                    {signals.delegatedAuthorityTargets
                        .map(addressUtils.truncateAddress)
                        .join(', ')}
                </AlertCard>
            )}
            {signals.inferredGateCount > 0 && (
                <AlertCard
                    message={t('app.workspace.workspaceSignals.inferred', {
                        count: signals.inferredGateCount,
                    })}
                    variant="info"
                />
            )}
            {signals.failedTargets.length > 0 && (
                <AlertCard
                    message={t('app.workspace.workspaceSignals.failed', {
                        count: signals.failedTargets.length,
                    })}
                    variant="critical"
                >
                    {signals.failedTargets
                        .map(addressUtils.truncateAddress)
                        .join(', ')}
                </AlertCard>
            )}
        </div>
    );
};
