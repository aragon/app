import { DashboardDaoSlotId } from '@/modules/dashboard/constants/moduleDaoSlots';
import { pluginRegistryUtils } from '@/shared/utils/pluginRegistryUtils';
import { BoundlessPageHeader } from './components/boundlessPageHeader';
import { boundless } from './constants/boundless';

export const initialiseBoundless = () => {
    pluginRegistryUtils
        .registerPlugin(boundless)

        .registerSlotComponent({
            slotId: DashboardDaoSlotId.DASHBOARD_DAO_HEADER,
            pluginId: boundless.id,
            component: BoundlessPageHeader,
        });
};
