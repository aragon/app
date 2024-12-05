import type { IProposalAction } from '@/modules/governance/api/governanceService';
import type {
    IAutocompleteInputGroup,
    IAutocompleteInputItem,
    IAutocompleteInputProps,
} from '@/shared/components/forms/autocompleteInput';

export interface IActionComposerItem<TMeta = undefined> extends IAutocompleteInputItem<TMeta> {
    /**
     * Default value for the action.
     */
    defaultValue?: IProposalAction;
}

export type ActionComposerMode = 'native' | 'custom';

export interface IActionComposerProps<TMeta = undefined>
    extends Omit<IAutocompleteInputProps, 'items' | 'groups' | 'selectItemLabel' | 'onChange'> {
    /**
     * Callback called on action selected.
     */
    onActionSelected: (item: IActionComposerItem<TMeta>) => void;
    /**
     * ID of the DAO.
     */
    daoId: string;
    /**
     * Additional native items to be displayed.
     */
    nativeItems: Array<IActionComposerItem<TMeta>>;
    /**
     * Additional native groups to be displayed.
     */
    nativeGroups: IAutocompleteInputGroup[];
    /**
     * Defines if the components displays the native or custom proposal actions.
     * @default default
     */
    mode?: ActionComposerMode;
}
