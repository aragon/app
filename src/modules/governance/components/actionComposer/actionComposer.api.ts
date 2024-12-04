import type { IProposalAction, ProposalActionType } from '@/modules/governance/api/governanceService';
import type {
    IAutocompleteInputGroup,
    IAutocompleteInputItem,
    IAutocompleteInputProps,
} from '@/shared/components/forms/autocompleteInput';
import type { IProposalActionComponentProps } from '@aragon/gov-ui-kit';
import type { IProposalActionData } from '../createProposalForm';

export interface IActionComposerItem<TMeta = undefined, TType = undefined> extends IAutocompleteInputItem<TMeta> {
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
    items: Array<IActionComposerItem<TMeta, TType>>;
    /**
     * Custom action components.
     */
    components: Record<
        string,
        React.ComponentType<IProposalActionComponentProps<IProposalActionData<IProposalAction, TMeta>>>
    >;
}

export type ActionComposerMode = 'native' | 'custom';

export interface IActionComposerProps<TMeta = undefined>
    extends Omit<IAutocompleteInputProps, 'items' | 'groups' | 'selectItemLabel' | 'onChange'> {
    /**
     * Callback called on action selected.
     */
    onActionSelected: (action: IProposalAction, meta?: TMeta) => void;
    /**
     * ID of the DAO.
     */
    daoId: string;
    /**
     * Plugin specific items.
     */
    pluginItems: IPluginActionComposerData['items'];
    /**
     * Plugin specific groups.
     */
    pluginGroups: IPluginActionComposerData['groups'];
    /**
     * Defines if the components displays the native or custom proposal actions.
     * @default default
     */
    mode?: ActionComposerMode;
}
