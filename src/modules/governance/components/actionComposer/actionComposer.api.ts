import type { IProposalAction } from '@/modules/governance/api/governanceService';
import type { IAutocompleteInputGroup, IAutocompleteInputItem } from '@/shared/components/forms/autocompleteInput';
import type { IProposalActionComponentProps } from '@aragon/gov-ui-kit';
import type { IProposalActionData } from '../createProposalForm';

interface IPluginActionComposerItem extends IAutocompleteInputItem {
    /**
     * Default value for the action.
     */
    defaultValue: IProposalAction;
}

export interface IPluginActionComposerData {
    /**
     * Autocomplete groups for the actions.
     */
    groups: IAutocompleteInputGroup[];
    /**
     * Autocomplete action item.
     */
    items: IPluginActionComposerItem[];
    /**
     * Custom action components.
     */
    components: Record<
        string,
        React.ComponentType<IProposalActionComponentProps<IProposalActionData<IProposalAction>>>
    >;
}
