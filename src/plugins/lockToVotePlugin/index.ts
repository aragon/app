import { CreateDaoSlotId } from '@/modules/createDao/constants/moduleSlots';
import { pluginRegistryUtils } from '@/shared/utils/pluginRegistryUtils';
import { LockToVoteSetupGovernance } from './components/lockToVoteSetupGovernance/lockToVoteSetupGovernance';
import { LockToVoteSetupMembership } from './components/lockToVoteSetupMembership/lockToVoteSetupMembership';
import { lockToVotePlugin } from './constants/lockToVotePlugin';

export const initialiseLockToVotePlugin = () => {
    pluginRegistryUtils
        .registerPlugin(lockToVotePlugin)
        .registerSlotComponent({
            slotId: CreateDaoSlotId.CREATE_DAO_SETUP_MEMBERSHIP,
            pluginId: lockToVotePlugin.id,
            component: LockToVoteSetupMembership,
        })
        .registerSlotComponent({
            slotId: CreateDaoSlotId.CREATE_DAO_SETUP_GOVERNANCE,
            pluginId: lockToVotePlugin.id,
            component: LockToVoteSetupGovernance,
        });
};
