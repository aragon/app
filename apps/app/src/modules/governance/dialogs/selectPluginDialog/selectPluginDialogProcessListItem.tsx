import { useEffect } from 'react';
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

export const SelectPluginDialogProcessListItem: React.FC<
    ISelectPluginDialogProcessListItemProps
> = (props) => {
    const { process, dao, pluginId, onEligibilityResult, ...otherProps } =
        props;

    const { result, isLoading } = useSimulateProposalCreation({
        plugin: process,
        network: dao?.network,
    });
    const simulationFailed = result === 'failure';

    // Fail open on inconclusive simulations (request error or simulation
    // disabled): only a concrete revert marks the process as not eligible, so
    // users are not blocked when the permission check itself cannot run. This is
    // just an UX improvement, not a line of defense. Create proposal guard would
    // catch it in rare cases when simulation cannot be run for any reason.
    useEffect(() => {
        if (!isLoading) {
            onEligibilityResult(pluginId, !simulationFailed);
        }
    }, [isLoading, simulationFailed, pluginId, onEligibilityResult]);

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
