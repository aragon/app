import { pluginRegistryUtils } from '@/shared/utils/pluginRegistryUtils';
import { lockToVotePlugin } from './constants/lockToVotePlugin';

export const initialiseLockToVotePlugin = () => {
    pluginRegistryUtils.registerPlugin(lockToVotePlugin);
};
