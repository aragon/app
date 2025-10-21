import type { IconType } from '@aragon/gov-ui-kit';
import type { ComponentType } from 'react';
import type { Hex } from 'viem';
import type { IProposalActionData } from '@/modules/governance/components/createProposalForm';

/**
 * Custom action component type for action views.
 */
export type ActionViewComponent = ComponentType<{
    action: IProposalActionData;
    index: number;
    daoId?: string;
    [key: string]: unknown;
}>;

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
     * Human-readable label for the action.
     */
    label?: string;

    /**
     * Icon to display for the action.
     */
    icon?: IconType;
}
