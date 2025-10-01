import type { IEventLogPluginType } from './enum';

export interface IPluginLogs {
    logs: IPluginLog[];
}

export interface IPluginLog {
    id: string;
    event: IEventLogPluginType;
    transactionHash: string;
    blockNumber: number;
    timestamp: number;
    data: Record<string, unknown>;
}