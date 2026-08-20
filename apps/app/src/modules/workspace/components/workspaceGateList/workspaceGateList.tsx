import { Accordion } from '@aragon/gov-ui-kit';
import type { IWorkspaceGate } from '../../api/workspaceService';
import { WorkspaceGateItem } from './workspaceGateItem';

export interface IWorkspaceGateListProps {
    /**
     * Gates to display.
     */
    gates: IWorkspaceGate[];
    /**
     * Prefix used to build the accordion item values, must be unique per list.
     */
    idPrefix: string;
    /**
     * Chain ID used to build the block explorer links.
     */
    chainId?: number;
    /**
     * Hides the holders of each gate when set to true.
     */
    hideHolders?: boolean;
}

export const WorkspaceGateList: React.FC<IWorkspaceGateListProps> = (props) => {
    const { gates, idPrefix, chainId, hideHolders } = props;

    return (
        <Accordion.Container isMulti={true}>
            {gates.map((gate, index) => (
                <WorkspaceGateItem
                    chainId={chainId}
                    gate={gate}
                    hideHolders={hideHolders}
                    key={`${idPrefix}-${index.toString()}`}
                    value={`${idPrefix}-${index.toString()}`}
                />
            ))}
        </Accordion.Container>
    );
};
