import {
    type IProcessDataListItemProps,
    ProcessDataListItem,
} from '@/shared/components/processDataListItem';
import { useSimulateProposalCreation } from '../../hooks/useSimulateProposal';

export type ISelectPluginDialogProcessListItemProps = IProcessDataListItemProps;

export const SelectPluginDialogProcessListItem: React.FC<
    ISelectPluginDialogProcessListItemProps
> = (props) => {
    const { process, dao } = props;

    const { result } = useSimulateProposalCreation({
        plugin: process,
        network: dao?.network,
    });
    const simulationFailed = result === 'failure';

    return (
        <ProcessDataListItem
            {...props}
            isDisabled={simulationFailed}
            showNotEligibleHelpText={simulationFailed}
        />
    );
};
