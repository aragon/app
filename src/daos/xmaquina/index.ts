import { DashboardDaoSlotId } from '@/modules/dashboard/constants/moduleDaoSlots';
import { pluginRegistryUtils } from '@/shared/utils/pluginRegistryUtils';
import { XmaquinaPageHeader } from './components';
import { xmaquina } from './constants/xmaquina';

export const initialiseXmaquina = () => {
    pluginRegistryUtils
        .registerPlugin(xmaquina)

        .registerSlotComponent({
            slotId: DashboardDaoSlotId.DASHBOARD_DAO_HEADER,
            pluginId: xmaquina.id,
            component: XmaquinaPageHeader,
        });
};
