import { DashboardDaoSlotId } from '@/modules/dashboard/constants/moduleDaoSlots';
import { pluginRegistryUtils } from '@/shared/utils/pluginRegistryUtils';
import { CryptexPageHeader } from './components/cryptexPageHeader';
import { cryptex } from './constants/cryptex';

export const initialiseCryptex = () => {
    pluginRegistryUtils
        .registerPlugin(cryptex)

        .registerSlotComponent({
            slotId: DashboardDaoSlotId.DASHBOARD_DAO_HEADER,
            pluginId: cryptex.id,
            component: CryptexPageHeader,
        });
};
