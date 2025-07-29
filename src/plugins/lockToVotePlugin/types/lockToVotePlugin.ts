import type { ITokenPluginSettings } from '@/plugins/tokenPlugin/types';
import type { IDaoPlugin } from '@/shared/api/daoService';

export interface ILockToVotePlugin extends IDaoPlugin<ITokenPluginSettings> {
    /**
     * The address of the lock manager contract.
     */
    lockManagerAddress: string;
}
