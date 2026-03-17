import { DashboardDaoSlotId } from '@/modules/dashboard/constants/moduleDaoSlots';
import { pluginRegistryUtils } from '@/shared/utils/pluginRegistryUtils';
import { AragonDemoPageHeader } from './components/aragonDemoPageHeader';
import { aragonDemoDao } from './constants';

export const initialiseAragonDemo = () => {
    pluginRegistryUtils
        .registerPlugin(aragonDemoDao)

        .registerSlotComponent({
            slotId: DashboardDaoSlotId.DASHBOARD_DAO_HEADER,
            pluginId: aragonDemoDao.id,
            component: AragonDemoPageHeader,
        });
};
