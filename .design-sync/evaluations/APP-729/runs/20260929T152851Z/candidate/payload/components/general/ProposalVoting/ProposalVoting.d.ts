import * as React from 'react';

/**
 * ProposalVoting — from @aragon/gov-ui-kit@2.11.4.
 */
export interface ProposalVotingProps {
  [key: string]: unknown;
}

import type { IDefinitionSetting, IProposalVotingBodyBrand, ProposalVotingTab } from '@aragon/gov-ui-kit';

export interface ProposalVotingBreakdownMultisigProps {
  /** Current number of approvals for the proposal. */
  approvalsAmount: number;
  /** Minimum numbers of approvals required for the proposal to pass. */
  minApprovals: number;
  /** Number of members when the proposal was created. */
  membersCount: number;
  /** Defines if the voting is for vetoing the proposal or not. */
  isVeto?: boolean;
  /** Allows getting a ref to the component instance. Once the component unmounts, React will set `ref.current` to `null` (or  */
  ref?: React.Ref<unknown>;
  style?: React.CSSProperties;
  className?: string;
  id?: string;
  children?: React.ReactNode;
  /** When `true`, the content will stay mounted even when inactive. */
  forceMount?: true;
}

export interface ProposalVotingBreakdownTokenProps {
  /** Total voting power of users that voted yes. */
  totalYes: string | number;
  /** Total voting power of users that voted no. */
  totalNo: string | number;
  /** Total voting power of users that voted abstain. */
  totalAbstain: string | number;
  /** Percentage of tokens that need to vote "Yes" for a proposal to pass. */
  supportThreshold: number;
  /** Percentage of tokens that need to participate in a vote for it to be valid. */
  minParticipation: number;
  /** Symbol of the governance token. */
  tokenSymbol: string;
  /** Total supply of the governance token. */
  tokenTotalSupply: string | number;
  /** Defines if the voting is for vetoing the proposal or not. */
  isVeto?: boolean;
  /** Allows getting a ref to the component instance. Once the component unmounts, React will set `ref.current` to `null` (or  */
  ref?: React.Ref<unknown>;
  style?: React.CSSProperties;
  className?: string;
  id?: string;
  children?: React.ReactNode;
  /** When `true`, the content will stay mounted even when inactive. */
  forceMount?: true;
}

export interface ProposalVotingContainerProps {
  /** Status of the proposal. */
  status: unknown;
  /** End date of the proposal in timestamp or ISO format. */
  endDate?: string | number;
  /** List of plugin addresses to be displayed in the body summary list. */
  bodyList?: string[];
  /** Allows getting a ref to the component instance. Once the component unmounts, React will set `ref.current` to `null` (or  */
  ref?: React.Ref<unknown>;
  className?: string;
  id?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
}

export interface ProposalVotingDetailsProps {
  /** Governance settings displayed on the details tab. */
  settings?: IDefinitionSetting[];
  /** Allows getting a ref to the component instance. Once the component unmounts, React will set `ref.current` to `null` (or  */
  ref?: React.Ref<unknown>;
  style?: React.CSSProperties;
  className?: string;
  id?: string;
  children?: React.ReactNode;
  /** When `true`, the content will stay mounted even when inactive. */
  forceMount?: true;
}

export interface ProposalVotingStageContainerProps {
  /** Active stage that will be expanded for multi-stage proposals. */
  activeStage?: string;
  /** Callback called when the user selects a stage, to be used for expanding the current active stage for multi-stage proposa */
  onStageClick?: (stage?: string) => void;
  /** Allows getting a ref to the component instance. Once the component unmounts, React will set `ref.current` to `null` (or  */
  ref?: React.Ref<unknown>;
  style?: React.CSSProperties;
  className?: string;
  id?: string;
  children?: React.ReactNode;
}

export interface ProposalVotingStageProps {
  /** Status of the stage. */
  status: unknown;
  /** Start date of the stage in timestamp or ISO format. */
  startDate?: string | number;
  /** End date of the stage in timestamp or ISO format. */
  endDate?: string | number;
  /** Name of the proposal stage. */
  name: string;
  /** Index of the stage set automatically by the ProposalVotingStageContainer component. */
  index?: number;
  /** Min advance date of the proposal in timestamp or ISO format. */
  minAdvance?: string | number;
  /** Max advance date of the proposal in timestamp or ISO format. */
  maxAdvance?: string | number;
  /** List of plugin addresses to be displayed in the body summary list. */
  bodyList?: string[];
  /** Allows getting a ref to the component instance. Once the component unmounts, React will set `ref.current` to `null` (or  */
  ref?: React.Ref<unknown>;
  className?: string;
  id?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
}

export interface ProposalVotingVotesProps {
  /** Allows getting a ref to the component instance. Once the component unmounts, React will set `ref.current` to `null` (or  */
  ref?: React.Ref<unknown>;
  style?: React.CSSProperties;
  className?: string;
  id?: string;
  children?: React.ReactNode;
  /** When `true`, the content will stay mounted even when inactive. */
  forceMount?: true;
}

export interface ProposalVotingBodySummaryProps {
  /** Allows getting a ref to the component instance. Once the component unmounts, React will set `ref.current` to `null` (or  */
  ref?: React.Ref<unknown>;
  className?: string;
  id?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
}

export interface ProposalVotingBodySummaryListProps {
  /** Allows getting a ref to the component instance. Once the component unmounts, React will set `ref.current` to `null` (or  */
  ref?: React.Ref<unknown>;
  className?: string;
  id?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
}

export interface ProposalVotingBodySummaryListItemProps {
  className?: string;
  id: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
  /** Visual variant of the item. */
  variant?: "select" | "primary";
  /** Brand definitions of the body. */
  bodyBrand?: IProposalVotingBodyBrand;
}

export interface ProposalVotingBodyContentProps {
  /** Status of the proposal. */
  status: unknown;
  /** Name of the body. */
  name: string;
  /** ID of the body used to determine if the content should be rendered or not, only relevant for multi-body proposals. */
  bodyId?: string;
  /** Brand definitions of the body. */
  bodyBrand?: IProposalVotingBodyBrand;
  /** Hides the triggers for the specified tab IDs when set. */
  hideTabs?: ProposalVotingTab[];
  /** Allows getting a ref to the component instance. Once the component unmounts, React will set `ref.current` to `null` (or  */
  ref?: React.Ref<unknown>;
  className?: string;
  id?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
}

export declare const ProposalVoting: React.ComponentType<ProposalVotingProps> & {
  BreakdownMultisig: React.ComponentType<ProposalVotingBreakdownMultisigProps>;
  BreakdownToken: React.ComponentType<ProposalVotingBreakdownTokenProps>;
  Container: React.ComponentType<ProposalVotingContainerProps>;
  Details: React.ComponentType<ProposalVotingDetailsProps>;
  StageContainer: React.ComponentType<ProposalVotingStageContainerProps>;
  Stage: React.ComponentType<ProposalVotingStageProps>;
  Votes: React.ComponentType<ProposalVotingVotesProps>;
  BodySummary: React.ComponentType<ProposalVotingBodySummaryProps>;
  BodySummaryList: React.ComponentType<ProposalVotingBodySummaryListProps>;
  BodySummaryListItem: React.ComponentType<ProposalVotingBodySummaryListItemProps>;
  BodyContent: React.ComponentType<ProposalVotingBodyContentProps>;
};

