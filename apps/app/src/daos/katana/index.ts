import { CapitalFlowDaoSlotId } from '@/modules/capitalFlow/constants/moduleDaoSlots';
import { pluginRegistryUtils } from '@/shared/utils/pluginRegistryUtils';
import { CapitalDistributorTestMembersFileDownload } from './components/capitalDistributorTestMembersFileDownload';
import { katanaEmissionsTest, katanaVKatManagement } from './constants';
import { useKatanaVotingEscrowAddress } from './hooks/useKatanaVotingEscrowAddress';

export const initialiseKatana = () => {
    pluginRegistryUtils
        .registerPlugin(katanaEmissionsTest)

        .registerSlotComponent({
            slotId: CapitalFlowDaoSlotId.CAPITAL_DISTRIBUTOR_MEMBERS_FILE_DOWNLOAD,
            pluginId: katanaEmissionsTest.id,
            component: CapitalDistributorTestMembersFileDownload,
        })

        .registerSlotFunction({
            slotId: CapitalFlowDaoSlotId.CAPITAL_DISTRIBUTOR_VOTING_ESCROW_ADDRESS,
            pluginId: katanaEmissionsTest.id,
            function: useKatanaVotingEscrowAddress,
        })

        .registerPlugin(katanaVKatManagement)

        .registerSlotComponent({
            slotId: CapitalFlowDaoSlotId.CAPITAL_DISTRIBUTOR_MEMBERS_FILE_DOWNLOAD,
            pluginId: katanaVKatManagement.id,
            component: CapitalDistributorTestMembersFileDownload,
        })

        .registerSlotFunction({
            slotId: CapitalFlowDaoSlotId.CAPITAL_DISTRIBUTOR_VOTING_ESCROW_ADDRESS,
            pluginId: katanaVKatManagement.id,
            function: useKatanaVotingEscrowAddress,
        });
};
