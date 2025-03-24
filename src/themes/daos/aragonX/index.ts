import { pluginRegistryUtils } from '@/shared/utils/pluginRegistryUtils';
import { PageHeader } from '@/themes/daos/aragonX/components/pageHeader';
import { aragonX } from '../constants/daos';
import { DaoSlotId } from '../constants/slots';

export const initialiseAragonX = () => {
    pluginRegistryUtils
        .registerPlugin(aragonX)

        .registerSlotComponent({
            slotId: DaoSlotId.DASHBOARD_HEADER,
            pluginId: aragonX.id,
            component: PageHeader,
        });
};
