import type { Hex } from 'viem';
import type { IPluginSetupPermission } from '@/shared/utils/pluginTransactionUtils';
import type { EventLogPluginType } from './enum';

export interface IPluginEventLog {
    event: EventLogPluginType;
    pluginSetupRepo: Hex;
    pluginAddress: Hex;
    permissions: IPluginSetupPermission[];
    build: string;
    release: string;
}
