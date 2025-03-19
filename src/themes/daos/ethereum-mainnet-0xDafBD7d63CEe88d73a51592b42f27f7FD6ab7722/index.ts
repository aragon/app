import { pluginRegistryUtils } from '@/shared/utils/pluginRegistryUtils';
import { PageHeader } from '@/themes/daos/ethereum-mainnet-0xDafBD7d63CEe88d73a51592b42f27f7FD6ab7722/components/pageHeader';
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
