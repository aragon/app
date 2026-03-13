import { CapitalFlowDaoSlotId } from '@/modules/capitalFlow/constants/moduleDaoSlots';
import { pluginRegistryUtils } from '@/shared/utils/pluginRegistryUtils';
import { CapitalDistributorTestMembersFileDownload } from './components/capitalDistributorTestMembersFileDownload';
import {
    capitalDistributorTestDao,
    capitalDistributorTestVotingEscrowAddress,
    katanaCDDemo,
    katanaCDDemoVotingEscrowAddress,
    katanaEmissionsTest,
    katanaEmissionsTestVotingEscrowAddress,
} from './constants/capitalDistributorTestDao';

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
            function: () => katanaCDDemoVotingEscrowAddress,
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
            function: () => katanaEmissionsTestVotingEscrowAddress,
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
            function: () => capitalDistributorTestVotingEscrowAddress,
        });
};
