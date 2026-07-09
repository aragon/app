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
