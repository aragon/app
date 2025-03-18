import { pluginRegistryUtils } from '@/shared/utils/pluginRegistryUtils';
import { DaoSlotId } from '../constants/slots';
import { HeaderTest } from './headerTest';

const eagleOpsPlugin = {
    id: 'ethereum-mainnet-0x9c25a6b1bf3F6Fd2F68a62169c043045C2460482',
    name: 'ethereum-mainnet-0x9c25a6b1bf3F6Fd2F68a62169c043045C2460482',
};

export const initialiseEagleOps = () => {
    pluginRegistryUtils
        .registerPlugin(eagleOpsPlugin)

        .registerSlotComponent({
            slotId: DaoSlotId.DASHBOARD_HEADER,
            pluginId: eagleOpsPlugin.id,
            component: HeaderTest,
        });
};
