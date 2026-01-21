import { DashboardDaoSlotId } from '@/modules/dashboard/constants/moduleDaoSlots';
import { pluginRegistryUtils } from '@/shared/utils/pluginRegistryUtils';
import { AragonDemoPageHeader } from './components/aragonDemoPageHeader';
import { aragonDemoDaoPolicies } from './constants/aragonDemoDaoPolicies';

export const initialiseAragonDemo = () => {
    pluginRegistryUtils
        .registerPlugin(aragonDemoDaoPolicies)

        .registerSlotComponent({
            slotId: DashboardDaoSlotId.DASHBOARD_DAO_HEADER,
            pluginId: aragonDemoDaoPolicies.id,
            component: AragonDemoPageHeader,
        });
};
