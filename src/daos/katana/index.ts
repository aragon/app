import { CapitalFlowDaoSlotId } from '@/modules/capitalFlow/constants/moduleDaoSlots';
import { pluginRegistryUtils } from '@/shared/utils/pluginRegistryUtils';
import { CapitalDistributorTestMembersFileDownload } from './components/capitalDistributorTestMembersFileDownload';
import {
    capitalDistributorTestDao,
    katanaCDDemo,
    katanaEmissionsTest,
    katanaVKatManagement,
} from './constants';
import { useKatanaVotingEscrowAddress } from './hooks/useKatanaVotingEscrowAddress';

export const initialiseKatana = () => {
    pluginRegistryUtils
        .registerPlugin(katanaCDDemo)

        .registerSlotComponent({
            slotId: CapitalFlowDaoSlotId.CAPITAL_DISTRIBUTOR_MEMBERS_FILE_DOWNLOAD,
            pluginId: katanaCDDemo.id,
            component: CapitalDistributorTestMembersFileDownload,
        })

        .registerSlotFunction({
            slotId: CapitalFlowDaoSlotId.CAPITAL_DISTRIBUTOR_VOTING_ESCROW_ADDRESS,
            pluginId: katanaCDDemo.id,
            function: useKatanaVotingEscrowAddress,
        })

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

        // TODO: Remove capitalDistributorTest when mainnet capital distributor is live (APP-558)
        .registerPlugin(capitalDistributorTestDao)

        .registerSlotComponent({
            slotId: CapitalFlowDaoSlotId.CAPITAL_DISTRIBUTOR_MEMBERS_FILE_DOWNLOAD,
            pluginId: capitalDistributorTestDao.id,
            component: CapitalDistributorTestMembersFileDownload,
        })

        .registerSlotFunction({
            slotId: CapitalFlowDaoSlotId.CAPITAL_DISTRIBUTOR_VOTING_ESCROW_ADDRESS,
            pluginId: capitalDistributorTestDao.id,
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
