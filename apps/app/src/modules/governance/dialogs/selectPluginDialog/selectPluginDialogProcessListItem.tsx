import { useEffect } from 'react';
import { PluginSingleComponent } from '@/shared/components/pluginSingleComponent';
import {
    type IProcessDataListItemProps,
    ProcessDataListItem,
} from '@/shared/components/processDataListItem';
import { GovernanceSlotId } from '../../constants/moduleSlots';
import { useSimulateProposalCreation } from '../../hooks/useSimulateProposal';

export type ISelectPluginDialogProcessListItemProps =
    IProcessDataListItemProps & {
        /**
         * Unique ID of the process, reported alongside the eligibility result.
         */
        uniqueId: string;
        /**
         * Called with the proposal creation eligibility result once it is ready.
         */
        onEligibilityResult: (uniqueId: string, isEligible: boolean) => void;
    };

const SelectPluginDialogDefaultProcessListItem: React.FC<
    ISelectPluginDialogProcessListItemProps
> = (props) => {
    const { process, dao, uniqueId, onEligibilityResult, ...otherProps } =
        props;

    const { result, isLoading } = useSimulateProposalCreation({
        network: dao?.network,
        plugin: process,
    });
    const simulationFailed = result === 'failure';

    // Fail open on inconclusive simulations (request error or simulation
    // disabled): only a concrete revert marks the process as not eligible, so
    // users are not blocked when the simulation request itself cannot run.
    useEffect(() => {
        if (!isLoading) {
            onEligibilityResult(uniqueId, !simulationFailed);
        }
    }, [isLoading, onEligibilityResult, simulationFailed, uniqueId]);

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

export const SelectPluginDialogProcessListItem: React.FC<
    ISelectPluginDialogProcessListItemProps
> = (props) => (
    <PluginSingleComponent
        {...props}
        Fallback={SelectPluginDialogDefaultProcessListItem}
        pluginId={props.process.interfaceType}
        slotId={GovernanceSlotId.GOVERNANCE_SELECT_PLUGIN_PROCESS_LIST_ITEM}
    />
);
