import { CapitalFlowDaoSlotId } from '@/modules/capitalFlow/constants/moduleDaoSlots';
import { pluginRegistryUtils } from '@/shared/utils/pluginRegistryUtils';
import { CapitalDistributorTestMembersFileDownload } from '../capitalDistributorTest/components/capitalDistributorTestMembersFileDownload';
import { katanaVKatManagement } from './constants/katanaVKatManagement';

export const initialiseKatanaVKatManagement = () => {
    pluginRegistryUtils
        .registerPlugin(katanaVKatManagement)

        .registerSlotComponent({
            slotId: CapitalFlowDaoSlotId.CAPITAL_DISTRIBUTOR_MEMBERS_FILE_DOWNLOAD,
            pluginId: katanaVKatManagement.id,
            component: CapitalDistributorTestMembersFileDownload,
        });
};
