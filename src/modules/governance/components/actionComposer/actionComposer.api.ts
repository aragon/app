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

export interface IActionComposerProps<TMeta = undefined>
    extends Omit<IAutocompleteInputProps, 'items' | 'groups' | 'selectItemLabel' | 'onChange'> {
    /**
     * Callback called on action selected.
     */
    onActionSelected: (item: IActionComposerItem<TMeta>, inputValue: string) => void;
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
     * If true, the action composer will not include transfer action.
     */
    isWithoutTransfer?: boolean;
    /**
     * If true, the action composer will not include raw calldata action in custom/import groups.
     */
    isWithoutRawCalldata?: boolean;
}
