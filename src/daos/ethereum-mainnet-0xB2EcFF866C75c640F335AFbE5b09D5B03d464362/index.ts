import { pluginRegistryUtils } from '@/shared/utils/pluginRegistryUtils';
import { DaoSlotId } from '../constants/slots';
import { eagleOpsDao } from '../constants/daos';
import { AragonFoundationAside } from './components/dashboardAside';

export const initialiseAragonFoundation = () => {
    pluginRegistryUtils
        .registerPlugin(eagleOpsDao)

        .registerSlotComponent({
            slotId: DaoSlotId.DASHBOARD_ASIDE,
            pluginId: eagleOpsDao.id,
            component: AragonFoundationAside,
        });
};
