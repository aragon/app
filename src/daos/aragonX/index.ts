import { DashboardThemeSlotId } from '@/modules/dashboard/constants/moduleThemeSlots';
import { pluginRegistryUtils } from '@/shared/utils/pluginRegistryUtils';
import { PageHeader } from './components/pageHeader';
import { aragonXDao } from './constants/aragonXDao';

export const initialiseAragonX = () => {
    pluginRegistryUtils
        .registerPlugin(aragonXDao)

        .registerSlotComponent({
            slotId: DashboardThemeSlotId.DASHBOARD_THEME_HEADER,
            pluginId: aragonXDao.id,
            component: PageHeader,
        });
};
