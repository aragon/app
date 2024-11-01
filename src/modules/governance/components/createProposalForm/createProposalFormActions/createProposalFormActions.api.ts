import type { IProposalAction } from '@/modules/governance/api/governanceService';
import type { IProposalActionComponentProps } from '@aragon/gov-ui-kit';
import type { IProposalActionData } from '../createProposalFormDefinitions';
import type { IAutocompleteInputGroup, IAutocompleteInputItem } from '@/shared/components/forms/autocompleteInput';

export interface IPluginActionItem extends IAutocompleteInputItem {
    defaultValue: IProposalAction;
}

export interface IPluginActionData {
    groups: IAutocompleteInputGroup[];
    items: IPluginActionItem[];
    components: Record<
        string,
        React.ComponentType<IProposalActionComponentProps<IProposalActionData<IProposalAction>>>
    >;
}
