import { pluginRegistryUtils } from '@/shared/utils/pluginRegistryUtils';
import { DaoSlotId } from '../constants/slots';
import { aragonX } from '../constants/daos';
import { AragonXDashboardHeader } from './components/aragonXDashboardHeader';

export const initialiseEagleOps = () => {
    pluginRegistryUtils
        .registerPlugin(aragonX)

        .registerSlotComponent({
            slotId: DaoSlotId.DASHBOARD_HEADER,
            pluginId: aragonX.id,
            component: AragonXDashboardHeader,
        });
};
