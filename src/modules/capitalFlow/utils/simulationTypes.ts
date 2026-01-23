/**
 * Types for simulation summary
 */

export type FlowNodeRole = 'dao' | 'subdao' | 'burn' | 'wallet' | 'contract';

export interface IFlowToken {
    address: string;
    symbol: string;
    name: string;
    decimals: number;
    logo?: string;
    dollarValue?: string;
}

export interface IAddressTokenDelta {
    token: IFlowToken;
    amount: string;
    rawAmount?: string;
    dollarValue?: string;
}

export interface IAddressDelta {
    address: string;
    label: string;
    role: FlowNodeRole;
    isKnown: boolean;
    avatar?: string | null;
    ens?: string | null;
    tokens: IAddressTokenDelta[];
}

export type SummaryGroupKind = 'dao' | 'external';

export interface ISummaryGroup {
    kind: SummaryGroupKind;
    title: string;
    items: IAddressDelta[];
}

export interface IProcessedSimulation {
    status: 'success' | 'failed';
    error?: string;
    tenderlyUrl?: string;
    summaryGroups: ISummaryGroup[];
}
