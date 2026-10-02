import { useEffect } from 'react';
import { useSafeProcessPermissionCheckProposalCreation } from '@/plugins/safeMultisigPlugin/hooks/useSafeProcessPermissionCheckProposalCreation';
import { PluginInterfaceType } from '@/shared/api/daoService';
import {
    type IProcessDataListItemProps,
    ProcessDataListItem,
} from '@/shared/components/processDataListItem';
import { useSimulateProposalCreation } from '../../hooks/useSimulateProposal';

export type ISelectPluginDialogProcessListItemProps =
    IProcessDataListItemProps & {
        /**
         * Unique ID of the process, reported alongside the eligibility result.
         */
        pluginId: string;
        /**
         * Called with the proposal creation eligibility result once it is ready.
         */
        onEligibilityResult: (pluginId: string, isEligible: boolean) => void;
    };

const SelectNativeSafeProcessListItem: React.FC<
    ISelectPluginDialogProcessListItemProps
> = (props) => {
    const { process, dao, pluginId, onEligibilityResult, ...otherProps } =
        props;
    const { hasPermission, isLoading } =
        useSafeProcessPermissionCheckProposalCreation({
            daoId: dao?.id ?? '',
            plugin: process,
            useConnectedUserInfo: dao != null,
        });

    useEffect(() => {
        if (!isLoading) {
            onEligibilityResult(pluginId, hasPermission);
        }
    }, [hasPermission, isLoading, onEligibilityResult, pluginId]);

    return (
        <ProcessDataListItem
            {...otherProps}
            dao={dao}
            isDisabled={isLoading || !hasPermission}
            process={process}
            showNotEligibleHelpText={!isLoading && !hasPermission}
        />
    );
};

export const SelectPluginDialogProcessListItem: React.FC<
    ISelectPluginDialogProcessListItemProps
> = (props) => {
    const { process, dao, pluginId, onEligibilityResult, ...otherProps } =
        props;

    const { result, isLoading } = useSimulateProposalCreation({
        enabled: process.interfaceType !== PluginInterfaceType.SAFE,
        network: dao?.network,
        plugin: process,
    });
    const simulationFailed = result === 'failure';

    // Fail open on inconclusive simulations (request error or simulation
    // disabled): only a concrete revert marks the process as not eligible, so
    // users are not blocked when the permission check itself cannot run. This is
    // just an UX improvement, not a line of defense. Create proposal guard would
    // catch it in rare cases when simulation cannot be run for any reason.
    useEffect(() => {
        if (process.interfaceType !== PluginInterfaceType.SAFE && !isLoading) {
            onEligibilityResult(pluginId, !simulationFailed);
        }
    }, [
        isLoading,
        pluginId,
        onEligibilityResult,
        process.interfaceType,
        simulationFailed,
    ]);

    if (process.interfaceType === PluginInterfaceType.SAFE) {
        return <SelectNativeSafeProcessListItem {...props} />;
    }

    return (
        <ProcessDataListItem
            {...otherProps}
            dao={dao}
            isDisabled={isLoading || simulationFailed}
            process={process}
            showNotEligibleHelpText={simulationFailed}
        />
    );
};
