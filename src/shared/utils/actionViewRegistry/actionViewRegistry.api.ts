import type { ActionComposerPluginComponent } from '@/modules/governance/types/actionComposerPluginData';
import type { ProposalActionComponent } from '@aragon/gov-ui-kit';
import type { Hex } from 'viem';
import type { IActionComposerInputItem } from '../../../modules/governance/components/actionComposer';
import type { IProposalActionData } from '../../../modules/governance/components/createProposalForm';
import type { IAutocompleteInputGroup } from '../../components/forms/autocompleteInput';
import type { TranslationFunction } from '../../components/translationsProvider';

/**
 * Custom action component type for action views.
 */
export type ActionViewComponent = ActionComposerPluginComponent<unknown>;

/**
 * Descriptor for registering a custom action view.
 */
export interface IActionViewDescriptor {
    /**
     * Unique identifier for this action view.
     */
    id: string;
    /**
     * Function selector to match against (e.g., "0xa9059cbb").
     */
    functionSelector?: Hex;
    /**
     * Text signature of the smart contract function (e.g. setMetadata(bytes))
     */
    textSignature?: string;
    /**
     * Permission ID to match against (alternative matching criteria).
     */
    permissionId?: string;
    /**
     * Custom React component to render the action in create/edit mode, i.e. create proposal page.
     */
    componentCreate: Record<string, ActionViewComponent>;
    /**
     * Custom React component to render the action in read only mode, i.e. proposal details page.
     */
    componentDetails?: ProposalActionComponent<IProposalActionData>;
    /**
     *  Action composer item.
     */
    getItem: (params: { contractAddress: string; t: TranslationFunction }) => IActionComposerInputItem;
}

/**
 * Descriptor for registering an actions group.
 */
export interface IActionGroupDescriptor {
    /**
     * Permission ID to match against (alternative matching criteria).
     */
    permissionId: string;
    /**
     *  Action composer item.
     */
    getGroup: (params: { contractAddress: string; t: TranslationFunction }) => IAutocompleteInputGroup;
}
