import { useProposalActionsContext } from '@/modules/proposalActions/proposalActionsContext/proposalActionsContext';
import { type IProposalAction } from '@/modules/proposalActions/proposalActionTypes/proposalAction';
import proposalActionsUtils from '@/modules/proposalActions/utils/proposalActionUtils';
import { Accordion, addressUtils } from '@aragon/ods';

interface ProposalActionsActionProps {
    action: IProposalAction;
    index: number;
    onToggle: () => void;
    isExpanded: boolean;
}

export const actionTypeToStringMapping: Record<string, string> = {
    withdrawToken: 'Withdraw assets',
};

export const ProposalActionsAction: React.FC<ProposalActionsActionProps> = ({ action, index, onToggle }) => {
    const { activeTab } = useProposalActionsContext();
    const ActionComponent = proposalActionsUtils.getActionComponent(action);

    const isDisabled = !ActionComponent;

    if (action.inputData == null) {
        return null;
    }

    return (
        <Accordion.Item value={`${index}`} disabled={isDisabled}>
            <Accordion.ItemHeader onClick={onToggle}>
                <div className="flex flex-col items-start">
                    <div>{actionTypeToStringMapping[action.type]}</div>
                    <div>{addressUtils.truncateAddress(action.inputData.contract)}</div>
                </div>
            </Accordion.ItemHeader>
            <Accordion.ItemContent>
                {activeTab === 'basic' && ActionComponent && <ActionComponent />}
                {activeTab === 'composer' && (
                    <div>
                        <div>Function: {action.inputData?.function}</div>
                        <div>Parameters: {JSON.stringify(action.inputData?.parameters, null, 2)}</div>
                    </div>
                )}
                {activeTab === 'code' && <pre>{JSON.stringify(action, null, 2)}</pre>}
            </Accordion.ItemContent>
        </Accordion.Item>
    );
};
