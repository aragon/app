import { CapitalFlowDaoSlotId } from '@/modules/capitalFlow/constants/moduleDaoSlots';
import { DashboardDaoSlotId } from '@/modules/dashboard/constants/moduleDaoSlots';
import { pluginRegistryUtils } from '@/shared/utils/pluginRegistryUtils';
import { CryptexMembersFileDownload } from './components/cryptexMembersFileDownload';
import { CryptexPageHeader } from './components/cryptexPageHeader';
import { cryptex, tokenVotingRewardsTest } from './constants';
import { useCryptexVotingEscrowAddress } from './hooks/useCryptexVotingEscrowAddress';

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
            component: CryptexMembersFileDownload,
        })

        .registerSlotFunction({
            slotId: CapitalFlowDaoSlotId.CAPITAL_DISTRIBUTOR_VOTING_ESCROW_ADDRESS,
            pluginId: cryptex.id,
            function: useCryptexVotingEscrowAddress,
        })
        .registerPlugin(tokenVotingRewardsTest)

        .registerSlotComponent({
            slotId: CapitalFlowDaoSlotId.CAPITAL_DISTRIBUTOR_MEMBERS_FILE_DOWNLOAD,
            pluginId: tokenVotingRewardsTest.id,
            component: CryptexMembersFileDownload,
        })

        .registerSlotFunction({
            slotId: CapitalFlowDaoSlotId.CAPITAL_DISTRIBUTOR_VOTING_ESCROW_ADDRESS,
            pluginId: tokenVotingRewardsTest.id,
            function: useCryptexVotingEscrowAddress,
        });
};
