import { CapitalFlowDaoSlotId } from '@/modules/capitalFlow/constants/moduleDaoSlots';
import { DashboardDaoSlotId } from '@/modules/dashboard/constants/moduleDaoSlots';
import { pluginRegistryUtils } from '@/shared/utils/pluginRegistryUtils';
import { TokenRewardMembersFileDownload } from '../strategies/tokenReward';
import { CryptexPageHeader } from './components/cryptexPageHeader';
import { cryptex } from './constants/cryptex';

export const initialiseCryptex = () => {
    pluginRegistryUtils
        .registerPlugin(cryptex)

        .registerSlotComponent({
            slotId: DashboardDaoSlotId.DASHBOARD_DAO_HEADER,
            pluginId: cryptex.id,
            component: CryptexPageHeader,
        })

        .registerSlotComponent({
            slotId: CapitalFlowDaoSlotId.CAPITAL_DISTRIBUTOR_MEMBERS_FILE_DOWNLOAD,
            pluginId: cryptex.id,
            component: TokenRewardMembersFileDownload,
        });
};
