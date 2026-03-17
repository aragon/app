import type { IDaoDomainDefinition } from '@/daos/daoDomains';
import { daoSlotUtils } from '@/daos/utils/daoSlotUtils';
import { CapitalFlowDaoSlotId } from '@/modules/capitalFlow/constants/moduleDaoSlots';
import { DashboardDaoSlotId } from '@/modules/dashboard/constants/moduleDaoSlots';
import { CryptexMembersFileDownload } from '../components/cryptexMembersFileDownload';
import { CryptexPageHeader } from '../components/cryptexPageHeader';
import {
    cryptex,
    cryptexTokenVotingPluginAddress,
    getCryptexVotingEscrowAddress,
} from './cryptexMainnet';
import {
    tokenCDTest,
    tokenCDTestTokenVotingPluginAddress,
} from './tokenCDTest';

interface ICryptexDomainMeta {
    /**
     * Token voting plugin address used by Cryptex reward flows.
     */
    tokenVotingPluginAddress?: `0x${string}`;
}

interface ICryptexDomainConfig {
    /**
     * Plugin identity for the Cryptex domain.
     */
    plugin: typeof cryptex | typeof tokenCDTest;
    /**
     * Token voting plugin address used for reward file generation.
     */
    tokenVotingPluginAddress: `0x${string}`;
    /**
     * Whether the domain should register the custom dashboard header.
     */
    hasHeader?: boolean;
}

const cryptexDomainConfigs: ICryptexDomainConfig[] = [
    {
        plugin: cryptex,
        tokenVotingPluginAddress: cryptexTokenVotingPluginAddress,
        hasHeader: true,
    },
    {
        // TODO: Remove tokenCDTest when mainnet capital distributor is live (APP-558)
        plugin: tokenCDTest,
        tokenVotingPluginAddress: tokenCDTestTokenVotingPluginAddress,
    },
];

const getCryptexSlotComponents = (config: ICryptexDomainConfig) => [
    ...(config.hasHeader === true
        ? [
              {
                  slotId: DashboardDaoSlotId.DASHBOARD_DAO_HEADER,
                  component: CryptexPageHeader,
              },
          ]
        : []),
    {
        slotId: CapitalFlowDaoSlotId.CAPITAL_DISTRIBUTOR_MEMBERS_FILE_DOWNLOAD,
        component: CryptexMembersFileDownload,
    },
];

const getCryptexSlotFunctions = () => [
    {
        slotId: CapitalFlowDaoSlotId.CAPITAL_DISTRIBUTOR_VOTING_ESCROW_ADDRESS,
        fn: getCryptexVotingEscrowAddress,
    },
];

export const cryptexDomains: IDaoDomainDefinition<ICryptexDomainMeta>[] =
    daoSlotUtils.generateDomain<ICryptexDomainConfig, ICryptexDomainMeta>({
        configs: cryptexDomainConfigs,
        getPlugin: (config) => config.plugin,
        getMeta: (config) => ({
            tokenVotingPluginAddress: config.tokenVotingPluginAddress,
        }),
        getSlotComponents: getCryptexSlotComponents,
        getSlotFunctions: getCryptexSlotFunctions,
    });
