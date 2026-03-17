import type { IDaoDomainDefinition } from '@/daos/daoDomains';
import { daoSlotUtils } from '@/daos/utils/daoSlotUtils';
import { CapitalFlowDaoSlotId } from '@/modules/capitalFlow/constants/moduleDaoSlots';
import { CapitalDistributorTestMembersFileDownload } from '../components/capitalDistributorTestMembersFileDownload';
import {
    capitalDistributorTestDao,
    capitalDistributorTestVotingEscrowAddress,
} from './capitalDistributorTest';
import { katanaCDDemo, katanaCDDemoVotingEscrowAddress } from './katanaCDDemo';
import {
    katanaEmissionsTest,
    katanaEmissionsTestVotingEscrowAddress,
} from './katanaEmissionsTest';
import { katanaVKatManagement } from './katanaVKatManagement';

interface IKatanaDomainMeta {
    votingEscrowAddress?: `0x${string}`;
}

interface IKatanaDomainConfig {
    plugin:
        | typeof capitalDistributorTestDao
        | typeof katanaCDDemo
        | typeof katanaEmissionsTest
        | typeof katanaVKatManagement;
    votingEscrowAddress?: `0x${string}`;
}

const katanaDomainConfigs: IKatanaDomainConfig[] = [
    {
        plugin: katanaCDDemo,
        votingEscrowAddress: katanaCDDemoVotingEscrowAddress,
    },
    {
        plugin: katanaEmissionsTest,
        votingEscrowAddress: katanaEmissionsTestVotingEscrowAddress,
    },
    {
        plugin: capitalDistributorTestDao,
        votingEscrowAddress: capitalDistributorTestVotingEscrowAddress,
    },
    {
        plugin: katanaVKatManagement,
    },
];

const getKatanaSlotComponents = () => [
    {
        slotId: CapitalFlowDaoSlotId.CAPITAL_DISTRIBUTOR_MEMBERS_FILE_DOWNLOAD,
        component: CapitalDistributorTestMembersFileDownload,
    },
];

const getKatanaSlotFunctions = (config: IKatanaDomainConfig) =>
    config.votingEscrowAddress == null
        ? []
        : [
              {
                  slotId: CapitalFlowDaoSlotId.CAPITAL_DISTRIBUTOR_VOTING_ESCROW_ADDRESS,
                  fn: () => config.votingEscrowAddress,
              },
          ];

export const katanaDomains: IDaoDomainDefinition<IKatanaDomainMeta>[] =
    daoSlotUtils.generateDomain<IKatanaDomainConfig, IKatanaDomainMeta>({
        configs: katanaDomainConfigs,
        getPlugin: (config) => config.plugin,
        getMeta: (config) => ({
            votingEscrowAddress: config.votingEscrowAddress,
        }),
        getSlotComponents: getKatanaSlotComponents,
        getSlotFunctions: getKatanaSlotFunctions,
    });
