import type {
    IAutocompleteInputGroup,
    IAutocompleteInputItem,
    IAutocompleteInputProps,
} from '@/shared/components/forms/autocompleteInput';
import type { IAllowedAction } from '../../../api/executeSelectorsService';
import type { IProposalAction } from '../../../api/governanceService';
import type { ISmartContractAbi } from '../../../api/smartContractService';

export interface IActionComposerInputItem<TMeta = undefined>
    extends IAutocompleteInputItem<TMeta> {
    /**
     * Default value for the action.
     */
    defaultValue?: IProposalAction;
    /**
     * keccak256 permission-id the DAO must hold for this action to be executable.
     * When absent, the item is never permission-filtered. Matched by id, by target
     * contract (the action's `defaultValue.to` as `where`) and by grantee (the DAO
     * address as `who`) — see actionComposerUtils.getDaoActions.
     */
    requiredPermissionId?: string;
}

export interface IActionComposerInputProps<TMeta = undefined>
    extends Omit<
        IAutocompleteInputProps,
        'items' | 'groups' | 'selectItemLabel' | 'onChange'
    > {
    /**
     * Callback called on action selected.
     */
    onActionSelected: (
        item: IActionComposerInputItem<TMeta>,
        inputValue: string,
    ) => void;
    /**
     * ID of the DAO.
     */
    daoId: string;
    /**
     * Additional native items to be displayed.
     */
    nativeItems: IActionComposerInputItem<TMeta>[];
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
     * ABIs of imported smart contracts to be used for adding custom actions.
     */
    importedContractAbis: ISmartContractAbi[];
    /**
     * List of allowed actions to show.
     * If provided, only actions that are allowed will be displayed.
     */
    allowedActions?: IAllowedAction[];
}
