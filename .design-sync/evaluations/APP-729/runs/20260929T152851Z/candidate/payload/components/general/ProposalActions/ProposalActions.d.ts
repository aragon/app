import * as React from 'react';

/**
 * ProposalActions — from @aragon/gov-ui-kit@2.11.4.
 */
export interface ProposalActionsProps {
  [key: string]: unknown;
}

import type { IProposalAction, IProposalActionComponentProps, IProposalActionsArrayControls, IProposalActionsFooterDropdownItem } from '@aragon/gov-ui-kit';

export interface ProposalActionsRootProps {
  /** Number of proposal actions needed to handle the toggle-all logic. This is also calculated and set at runtime from the nu */
  actionsCount?: number;
  /** List of actions ids that are expanded. To be used for controlling the expanded / collapsed states. When using editMode,  */
  expandedActions?: string[];
  /** Callback called when the expanded state of an action changes. */
  onExpandedActionsChange?: (expandedActions: string[]) => void;
  /** Whether or not the list of actions is loading. */
  isLoading?: boolean;
  /** Whether or not the component is in edit mode. When true, actions show index badges, movement controls, and remove button */
  editMode?: boolean;
  /** Allows getting a ref to the component instance. Once the component unmounts, React will set `ref.current` to `null` (or  */
  ref?: React.Ref<unknown>;
  className?: string;
  id?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
}

export interface ProposalActionsContainerProps {
  /** Custom description for the empty state. */
  emptyStateDescription: string;
  /** Allows getting a ref to the component instance. Once the component unmounts, React will set `ref.current` to `null` (or  */
  ref?: React.Ref<unknown>;
  style?: React.CSSProperties;
  className?: string;
  id?: string;
  children?: React.ReactNode;
}

export interface ProposalActionsItemProps<TAction extends IProposalAction = IProposalAction> {
  /** Proposal action to be rendered. */
  action: TAction;
  /** Function selector of the action to be displayed optionally. */
  actionFunctionSelector?: string;
  /** Count of the action to be displayed optionally. */
  actionCount?: number;
  /** Index of the action injected by the <ProposalActions.Container /> component. */
  index?: number;
  /** Value of the action used as accordion item value, defaults to the index property if not provided. */
  value?: string;
  /** Custom component for the action to be rendered on BASIC view. */
  CustomComponent?: React.ComponentClass<IProposalActionComponentProps<TAction>, any> | React.FunctionComponent<IProposalActionComponentProps<TAction>>;
  /** Controls for the action to be moved up or down. */
  arrayControls?: IProposalActionsArrayControls<TAction>;
  /** Enables the edit-mode when set to true. The RAW view will be editable only if the action has no DECODED view, similarly  */
  editMode?: boolean;
  /** Form prefix to be prepended to all proposal action text fields. */
  formPrefix?: string;
  /** If true, skips react-hook-form watching and treats the item as read-only (useful when rendered outside a FormProvider). */
  readOnly?: boolean;
  /** Chain ID for the blockchain network. */
  chainId?: number;
  /** Custom Wagmi configurations to use instead of retrieving it from the closest WagmiProvider. */
  wagmiConfig?: unknown;
}

export interface ProposalActionsFooterProps {
  /** List of action IDs to be used to toggle the expanded state for all the actions, defaults to the index of the actions. */
  actionIds?: string[];
  /** Optional dropdown items to display in a dropdown menu alongside the expand/collapse action. When provided, the expand/co */
  dropdownItems?: IProposalActionsFooterDropdownItem[];
  /** Allows getting a ref to the component instance. Once the component unmounts, React will set `ref.current` to `null` (or  */
  ref?: React.Ref<unknown>;
  className?: string;
  id?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
}

export declare const ProposalActions: {
  Root: React.ComponentType<ProposalActionsRootProps>;
  Container: React.ComponentType<ProposalActionsContainerProps>;
  Item: React.ComponentType<ProposalActionsItemProps>;
  ItemSkeleton: React.ComponentType<any>;
  Footer: React.ComponentType<ProposalActionsFooterProps>;
};

