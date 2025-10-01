import type { IPluginSetupPermission } from '@/shared/utils/pluginTransactionUtils';
import type { Hex } from 'viem';
import type { EventLogPluginType } from './enum';

export interface IPluginLog {
    id: string;
    event: EventLogPluginType;
    preparedSetupId: string | null;
    appliedSetupId: string | null;
    pluginSetupRepo: Hex;
    pluginAddress: Hex;
    permissions: IPluginSetupPermission[];
    build: string;
    release: string;
}
