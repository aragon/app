import type { ActionComposerPluginComponent } from '@/modules/governance/types/actionComposerPluginData';
import type { Hex } from 'viem';
import type { IActionComposerInputItem } from '../../../modules/governance/components/actionComposer';
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
     * Permission ID to match against (alternative matching criteria).
     */
    permissionId?: string;

    /**
     * Custom React component to render the action.
     */
    component: ActionViewComponent;
    /**
     *  Action composer item.
     */
    getItem: (params: { contractAddress: string }) => IActionComposerInputItem;
}

/**
 * Descriptor for registering a actions group.
 */
export interface IActionGroupDescriptor {
    /**
     * Permission ID to match against (alternative matching criteria).
     */
    permissionId: string;
    /**
     *  Action composer item.
     */
    getGroup: (params: { t: TranslationFunction; address: string }) => IAutocompleteInputGroup;
}
