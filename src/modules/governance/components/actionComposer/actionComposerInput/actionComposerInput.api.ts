import type {
    IAutocompleteInputGroup,
    IAutocompleteInputItem,
    IAutocompleteInputProps,
} from '@/shared/components/forms/autocompleteInput';
import type { IProposalAction } from '../../../api/governanceService';
import type { ISmartContractAbi } from '../../../api/smartContractService';

export interface IActionComposerInputItem<TMeta = undefined> extends IAutocompleteInputItem<TMeta> {
    /**
     * Default value for the action.
     */
    defaultValue?: IProposalAction;
}

export interface IActionComposerInputProps<TMeta = undefined>
    extends Omit<IAutocompleteInputProps, 'items' | 'groups' | 'selectItemLabel' | 'onChange'> {
    /**
     * Callback called on action selected.
     */
    onActionSelected: (item: IActionComposerInputItem<TMeta>, inputValue: string) => void;
    /**
     * ID of the DAO.
     */
    daoId: string;
    /**
     * Additional native items to be displayed.
     */
    nativeItems: Array<IActionComposerInputItem<TMeta>>;
    /**
     * Additional native groups to be displayed.
     */
    nativeGroups: IAutocompleteInputGroup[];
    /**
     * Action types to exclude from the list of available actions.
     * The filtering is based on the `defaultValue.type` of the action item.
     */
    excludeActionTypes?: string[];
    /**
     * Exclude actions based on their selectors.
     * The filtering is based on the `info` field of the action item, which contains the selector.
     */
    excludeSelectors?: string[];
    /**
     * ABIs of imported smart contracts to be used for adding custom actions.
     */
    importedContractAbis: ISmartContractAbi[];
}
