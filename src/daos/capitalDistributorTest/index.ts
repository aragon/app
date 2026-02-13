import { pluginRegistryUtils } from '@/shared/utils/pluginRegistryUtils';
import { CapitalFlowDaoSlotId } from '../../modules/capitalFlow/constants/moduleDaoSlots';
import { CapitalDistributorTestMembersFileDownload } from './components/capitalDistributorTestMembersFileDownload';
import { capitalDistributorTestDao } from './constants/capitalDistributorTestDao';

export const initialiseCapitalDistributorTest = () => {
    pluginRegistryUtils
        .registerPlugin(capitalDistributorTestDao)

        .registerSlotComponent({
            slotId: CapitalFlowDaoSlotId.CAPITAL_DISTRIBUTOR_MEMBERS_FILE_DOWNLOAD,
            pluginId: capitalDistributorTestDao.id,
            component: CapitalDistributorTestMembersFileDownload,
        });
};
