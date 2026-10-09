import { ProposalActionsContainer } from './proposalActionsContainer';
import { ProposalActionsFooter } from './proposalActionsFooter';
import { ProposalActionsItem } from './proposalActionsItem';
import { ProposalActionsItemSkeleton } from './proposalActionsItemSkeleton';
import { ProposalActionsRoot } from './proposalActionsRoot';

/**
 * Usage notes:
 *
 * - Each `ProposalActions.Item` action must include `from`, `to`, `data`, `value`, `type`, and nullable
 *   `inputData`; use the exported `ProposalActionType` enum for action types with a basic view.
 * - Render `ProposalActions.Item` as a child of `ProposalActions.Container`: the container injects each item's
 *   zero-based `index`, and an item rendered without it throws.
 * - `editMode` requires a `react-hook-form` `FormProvider`; set `readOnly` when an item must render outside a
 *   provider without watching form values.
 */
export const ProposalActions = {
    Root: ProposalActionsRoot,
    Container: ProposalActionsContainer,
    Item: ProposalActionsItem,
    ItemSkeleton: ProposalActionsItemSkeleton,
    Footer: ProposalActionsFooter,
};

export * from './proposalActionsContainer';
export * from './proposalActionsDefinitions';
export * from './proposalActionsFooter';
export * from './proposalActionsItem';
export * from './proposalActionsItemSkeleton';
export * from './proposalActionsList';
export * from './proposalActionsRoot';
