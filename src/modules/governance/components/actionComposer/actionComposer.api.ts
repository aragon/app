import type { IProposalAction, ProposalActionType } from '@/modules/governance/api/governanceService';
import type { IAutocompleteInputGroup, IAutocompleteInputItem } from '@/shared/components/forms/autocompleteInput';
import type { IProposalActionComponentProps } from '@aragon/gov-ui-kit';
import type { IProposalActionData } from '../createProposalForm';

export interface IPluginActionComposerItem<TMeta, TType> extends IAutocompleteInputItem<TMeta> {
    /**
     * Default value for the action.
     */
    defaultValue: IProposalAction<TType>;
}

export interface IPluginActionComposerData<TMeta = undefined, TType = ProposalActionType> {
    /**
     * Autocomplete groups for the actions.
     */
    groups: IAutocompleteInputGroup[];
    /**
     * Autocomplete action item.
     */
    items: Array<IPluginActionComposerItem<TMeta, TType>>;
    /**
     * Custom action components.
     */
    components: Record<
        string,
        React.ComponentType<IProposalActionComponentProps<IProposalActionData<IProposalAction, TMeta>>>
    >;
}
