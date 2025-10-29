import type { ActionComposerPluginComponent } from '@/modules/governance/types/actionComposerPluginData';
import type { ProposalActionComponent } from '@aragon/gov-ui-kit';
import type { Hex } from 'viem';
import type { IActionComposerInputItem } from '../../../modules/governance/components/actionComposer';
import type { IProposalActionData } from '../../../modules/governance/components/createProposalForm';
import type { IAutocompleteInputGroup } from '../../components/forms/autocompleteInput';
import type { TranslationFunction } from '../../components/translationsProvider';

/**
 * Custom action component type for action views in create/edit mode.
 */
export type ActionViewCreateComponent = ActionComposerPluginComponent<unknown>;

/**
 * Custom action component type for action views in create/edit mode.
 */
export type ActionViewDetailsComponent = ProposalActionComponent<IProposalActionData>;

/**
 * Descriptor for registering a custom action view. Each view has 3 key components:
 *   - getItem() - callback returning ActionComposer input item
 *   - componentCreate - custom component for rendering action in create/edit mode
 *   - componentDetails - custom component for rendering action in read mode
 *
 * Views are uniquely identified by `functionSelector` and/or `id`, and could be
 * grouped by `permissionId`.
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
     * Permission ID to match against (alternative matching criteria).
     */
    permissionId?: string;
    /**
     * Custom React component to render the action in create/edit mode, i.e. create proposal page.
     */
    componentCreate: Record<string, ActionViewCreateComponent>;
    /**
     * Custom React component to render the action in read mode, i.e. proposal details page.
     */
    componentDetails?: ActionViewDetailsComponent;
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
