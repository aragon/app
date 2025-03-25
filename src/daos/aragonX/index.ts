import { DashboardDaoSlotId } from '@/modules/dashboard/constants/moduleDaoSlots';
import { pluginRegistryUtils } from '@/shared/utils/pluginRegistryUtils';
import { PageHeader } from './components/pageHeader';
import { aragonXDao } from './constants/aragonXDao';

export const initialiseAragonX = () => {
    pluginRegistryUtils
        .registerPlugin(aragonXDao)

        .registerSlotComponent({
            slotId: DashboardDaoSlotId.DASHBOARD_DAO_HEADER,
            pluginId: aragonXDao.id,
            component: PageHeader,
        });
};
