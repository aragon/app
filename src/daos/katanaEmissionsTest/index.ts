import { CapitalFlowDaoSlotId } from '@/modules/capitalFlow/constants/moduleDaoSlots';
import { pluginRegistryUtils } from '@/shared/utils/pluginRegistryUtils';
import { GaugeRewardMembersFileDownload } from '../strategies/gaugeReward';
import { katanaEmissionsTest } from './constants/katanaEmissionsTest';

export const initialiseKatanaEmissionsTest = () => {
    pluginRegistryUtils
        .registerPlugin(katanaEmissionsTest)

        .registerSlotComponent({
            slotId: CapitalFlowDaoSlotId.CAPITAL_DISTRIBUTOR_MEMBERS_FILE_DOWNLOAD,
            pluginId: katanaEmissionsTest.id,
            component: GaugeRewardMembersFileDownload,
        });
};
