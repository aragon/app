import { CapitalDistributorDaoSlotId } from '@/actions/capitalDistributor/constants/capitalDistributorDaoSlotId';
import { pluginRegistryUtils } from '@/shared/utils/pluginRegistryUtils';
import { capitalDistributorTestDao } from './constants/capitalDistributorTestDao';
import { katanaCDDemo } from './constants/katanaCDDemo';
import { katanaEmissionsTest } from './constants/katanaEmissionsTest';
import { KatanaRewardsMembersFileDownload } from './rewards';

export const initialiseKatana = () => {
    for (const dao of [
        capitalDistributorTestDao,
        katanaCDDemo,
        katanaEmissionsTest,
    ]) {
        pluginRegistryUtils
            .registerPlugin(dao)

            .registerSlotComponent({
                slotId: CapitalDistributorDaoSlotId.CAPITAL_DISTRIBUTOR_MEMBERS_FILE_DOWNLOAD,
                pluginId: dao.id,
                component: KatanaRewardsMembersFileDownload,
            });
    }
};
