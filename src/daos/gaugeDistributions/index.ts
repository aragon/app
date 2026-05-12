import { CapitalFlowDaoSlotId } from '@/modules/capitalFlow/constants/moduleDaoSlots';
import { pluginRegistryUtils } from '@/shared/utils/pluginRegistryUtils';
import { GaugeDistributionsMembersFileDownload } from './components/gaugeDistributionsMembersFileDownload';
import { gaugeDistributionsDemo } from './constants';
import { useGaugeDistributionsVotingEscrowAddress } from './hooks/useGaugeDistributionsVotingEscrowAddress';

export const initialiseGaugeDistributions = () => {
    pluginRegistryUtils
        .registerPlugin(gaugeDistributionsDemo)

        .registerSlotComponent({
            slotId: CapitalFlowDaoSlotId.CAPITAL_DISTRIBUTOR_MEMBERS_FILE_DOWNLOAD,
            pluginId: gaugeDistributionsDemo.id,
            component: GaugeDistributionsMembersFileDownload,
        })

        .registerSlotFunction({
            slotId: CapitalFlowDaoSlotId.CAPITAL_DISTRIBUTOR_VOTING_ESCROW_ADDRESS,
            pluginId: gaugeDistributionsDemo.id,
            function: useGaugeDistributionsVotingEscrowAddress,
        });
};
