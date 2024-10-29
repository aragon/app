import type { IProposalAction } from '@/modules/governance/api/governanceService';
import type { IconType, IProposalActionComponentProps } from '@aragon/gov-ui-kit';
import type { IProposalActionData } from '../createProposalFormDefinitions';

export type Group = {
    id: string;
    name: string;
    info: string;
    indexData: string[];
};

export type Item = {
    id: string;
    groupId: string;
    name: string;
    icon: IconType;
    defaultValue: IProposalAction;
};

export interface IPluginActionData {
    groups: Group[];
    items: Item[];
    components: Record<
        string,
        React.ComponentType<IProposalActionComponentProps<IProposalActionData<IProposalAction>>>
    >;
}
