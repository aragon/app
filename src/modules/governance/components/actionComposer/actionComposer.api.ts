import type { IProposalAction } from '@/modules/governance/api/governanceService';
import type {
    IAutocompleteInputGroup,
    IAutocompleteInputItem,
    IAutocompleteInputProps,
} from '@/shared/components/forms/autocompleteInput';

export type IProposalActionForm = Omit<IProposalAction, 'data'> & {
    /**
     * The data to send with the transaction.
     */
    data: string | null;
};

export interface IActionComposerItem<TMeta = undefined> extends IAutocompleteInputItem<TMeta> {
    /**
     * Default value for the action.
     */
    defaultValue?: IProposalActionForm;
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
