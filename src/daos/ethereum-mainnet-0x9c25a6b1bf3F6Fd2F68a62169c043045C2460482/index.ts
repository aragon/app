import { pluginRegistryUtils } from '@/shared/utils/pluginRegistryUtils';
import { DaoSlotId } from '../constants/slots';
import { eagleOpsDao } from '../constants/daos';
import { EagleOpsDashboardHeader } from './components/eagleOpsDashboardHeader';

export const initialiseEagleOps = () => {
    pluginRegistryUtils
        .registerPlugin(eagleOpsDao)

        .registerSlotComponent({
            slotId: DaoSlotId.DASHBOARD_HEADER,
            pluginId: eagleOpsDao.id,
            component: EagleOpsDashboardHeader,
        });
};
