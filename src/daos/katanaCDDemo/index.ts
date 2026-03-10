import { CapitalFlowDaoSlotId } from '@/modules/capitalFlow/constants/moduleDaoSlots';
import { pluginRegistryUtils } from '@/shared/utils/pluginRegistryUtils';
import { GaugeRewardMembersFileDownload } from '../strategies/gaugeReward';
import { katanaCDDemo } from './constants/katanaCDDemo';

export const initialiseKatanaCDDemo = () => {
    pluginRegistryUtils
        .registerPlugin(katanaCDDemo)

        .registerSlotComponent({
            slotId: CapitalFlowDaoSlotId.CAPITAL_DISTRIBUTOR_MEMBERS_FILE_DOWNLOAD,
            pluginId: katanaCDDemo.id,
            component: GaugeRewardMembersFileDownload,
        });
};
