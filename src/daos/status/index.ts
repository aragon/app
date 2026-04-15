import { CapitalFlowDaoSlotId } from '@/modules/capitalFlow/constants/moduleDaoSlots';
import { pluginRegistryUtils } from '@/shared/utils/pluginRegistryUtils';
import { StatusMembersFileDownload } from './components/statusMembersFileDownload';
import { statusTest } from './constants';
import { useStatusVotingEscrowAddress } from './hooks/useStatusVotingEscrowAddress';

export const initialiseStatus = () => {
    pluginRegistryUtils
        .registerPlugin(statusTest)

        .registerSlotComponent({
            slotId: CapitalFlowDaoSlotId.CAPITAL_DISTRIBUTOR_MEMBERS_FILE_DOWNLOAD,
            pluginId: statusTest.id,
            component: StatusMembersFileDownload,
        })

        .registerSlotFunction({
            slotId: CapitalFlowDaoSlotId.CAPITAL_DISTRIBUTOR_VOTING_ESCROW_ADDRESS,
            pluginId: statusTest.id,
            function: useStatusVotingEscrowAddress,
        });
};
