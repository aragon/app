import { CapitalDistributorDaoSlotId } from '@/actions/capitalDistributor/constants/capitalDistributorDaoSlotId';
import { DashboardDaoSlotId } from '@/modules/dashboard/constants/moduleDaoSlots';
import { pluginRegistryUtils } from '@/shared/utils/pluginRegistryUtils';
import { CryptexPageHeader } from './components/cryptexPageHeader';
import { cryptex } from './constants/cryptex';
import { CryptexRewardsMembersFileDownload } from './rewards';

export const initialiseCryptex = () => {
    pluginRegistryUtils
        .registerPlugin(cryptex)

        .registerSlotComponent({
            slotId: DashboardDaoSlotId.DASHBOARD_DAO_HEADER,
            pluginId: cryptex.id,
            component: CryptexPageHeader,
        })

        .registerSlotComponent({
            slotId: CapitalDistributorDaoSlotId.CAPITAL_DISTRIBUTOR_MEMBERS_FILE_DOWNLOAD,
            pluginId: cryptex.id,
            component: CryptexRewardsMembersFileDownload,
        });
};
