import { DashboardDaoSlotId } from '@/modules/dashboard/constants/moduleDaoSlots';
import { pluginRegistryUtils } from '@/shared/utils/pluginRegistryUtils';
import { AragonDemoPoliciesPageHeader } from './components/aragonDemoPoliciesPageHeader';
import { aragonDemoDaoPolicies } from './constants/aragonDemoDaoPolicies';

export const initialiseAragonDemoPolicies = () => {
    pluginRegistryUtils
        .registerPlugin(aragonDemoDaoPolicies)

        .registerSlotComponent({
            slotId: DashboardDaoSlotId.DASHBOARD_DAO_HEADER,
            pluginId: aragonDemoDaoPolicies.id,
            component: AragonDemoPoliciesPageHeader,
        });
};
