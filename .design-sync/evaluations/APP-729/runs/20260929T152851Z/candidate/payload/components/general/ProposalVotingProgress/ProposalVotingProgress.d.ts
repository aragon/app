import * as React from 'react';

/**
 * ProposalVotingProgress — from @aragon/gov-ui-kit@2.11.4.
 */
export interface ProposalVotingProgressProps {
  [key: string]: unknown;
}

import type { IProposalVotingProgressItemDescription, ProgressSize } from '@aragon/gov-ui-kit';

export interface ProposalVotingProgressItemProps<Breakpoint extends PropertyKey = any> {
  /** Name of the voting progress. */
  name: string;
  /** Additional description of the name of the voting progress, displayed after the name. */
  nameDescription?: string;
  /** Variant of the voting progress item component. */
  variant?: "default" | "critical" | "success";
  /** Description of the voting progress displayed below the progress bar. */
  description: IProposalVotingProgressItemDescription;
  /** Displays the progress bar value as percentage when set to true. */
  showPercentage?: boolean;
  /** Displays a status icon and text based on the progress bar and indicator values when set to true. The component renders a */
  showStatus?: boolean;
  style?: React.CSSProperties;
  className?: string;
  id?: string;
  children?: React.ReactNode;
  /** Current progress to be rendered. */
  value: number;
  /** Size of the progress depending on the current breakpoint. */
  responsiveSize?: Partial<Record<Breakpoint, ProgressSize>>;
  /** Threshold displayed with an indicator on the progress bar. */
  thresholdIndicator?: number;
}

export interface ProposalVotingProgressContainerProps {
  /** Flex direction of the ProposalVotingProgress components. On small screens, the components will be rendered in a flex col */
  direction?: "col" | "row";
  /** Allows getting a ref to the component instance. Once the component unmounts, React will set `ref.current` to `null` (or  */
  ref?: React.Ref<unknown>;
  className?: string;
  id?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
}

export declare const ProposalVotingProgress: React.ComponentType<ProposalVotingProgressProps> & {
  Item: React.ComponentType<ProposalVotingProgressItemProps>;
  Container: React.ComponentType<ProposalVotingProgressContainerProps>;
};

