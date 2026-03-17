import type { IDaoDomainDefinition } from '@/daos/daoDomains';
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
    tokenVotingPluginAddress?: `0x${string}`;
}

export const cryptexDomains: IDaoDomainDefinition<ICryptexDomainMeta>[] = [
    {
        plugin: cryptex,
        slotComponents: [
            {
                slotId: DashboardDaoSlotId.DASHBOARD_DAO_HEADER,
                component: CryptexPageHeader,
            },
            {
                slotId: CapitalFlowDaoSlotId.CAPITAL_DISTRIBUTOR_MEMBERS_FILE_DOWNLOAD,
                component: CryptexMembersFileDownload,
            },
        ],
        slotFunctions: [
            {
                slotId: CapitalFlowDaoSlotId.CAPITAL_DISTRIBUTOR_VOTING_ESCROW_ADDRESS,
                fn: getCryptexVotingEscrowAddress,
            },
        ],
        meta: {
            tokenVotingPluginAddress: cryptexTokenVotingPluginAddress,
        },
    },
    {
        // TODO: Remove tokenCDTest when mainnet capital distributor is live (APP-558)
        plugin: tokenCDTest,
        slotComponents: [
            {
                slotId: CapitalFlowDaoSlotId.CAPITAL_DISTRIBUTOR_MEMBERS_FILE_DOWNLOAD,
                component: CryptexMembersFileDownload,
            },
        ],
        slotFunctions: [
            {
                slotId: CapitalFlowDaoSlotId.CAPITAL_DISTRIBUTOR_VOTING_ESCROW_ADDRESS,
                fn: getCryptexVotingEscrowAddress,
            },
        ],
        meta: {
            tokenVotingPluginAddress: tokenCDTestTokenVotingPluginAddress,
        },
    },
];
