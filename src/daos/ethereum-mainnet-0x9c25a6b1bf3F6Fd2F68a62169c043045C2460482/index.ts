import { PageHeaderCustom } from '@/shared/components/page/pageHeaderCustom';
import { pluginRegistryUtils } from '@/shared/utils/pluginRegistryUtils';
import { aragonX } from '../constants/daos';
import { DaoSlotId } from '../constants/slots';

export const initialiseEagleOps = () => {
    pluginRegistryUtils
        .registerPlugin(aragonX)

        .registerSlotComponent({
            slotId: DaoSlotId.DASHBOARD_HEADER,
            pluginId: aragonX.id,
            component: PageHeaderCustom,
        });
};
