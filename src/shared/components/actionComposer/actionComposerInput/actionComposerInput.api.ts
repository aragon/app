import type { IProposalAction } from '@/modules/governance/api/governanceService';
import type { ISmartContractAbi } from '@/modules/governance/api/smartContractService';
import type {
    IAutocompleteInputGroup,
    IAutocompleteInputItem,
    IAutocompleteInputProps,
} from '../../forms/autocompleteInput';

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
     * ABIs of imported smart contracts to be used for adding custom actions.
     */
    importedContractAbis: ISmartContractAbi[];
    /**
     * If true, the action composer will not include transfer action.
     */
    isWithoutTransfer?: boolean;
    /**
     * If true, the action composer will not include raw calldata action in custom/import groups.
     */
    isWithoutRawCalldata?: boolean;
}
