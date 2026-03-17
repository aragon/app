import type { IDaoDomainDefinition } from '@/daos/daoDomains';
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

export const katanaDomains: IDaoDomainDefinition<IKatanaDomainMeta>[] = [
    {
        plugin: katanaCDDemo,
        slotComponents: [
            {
                slotId: CapitalFlowDaoSlotId.CAPITAL_DISTRIBUTOR_MEMBERS_FILE_DOWNLOAD,
                component: CapitalDistributorTestMembersFileDownload,
            },
        ],
        slotFunctions: [
            {
                slotId: CapitalFlowDaoSlotId.CAPITAL_DISTRIBUTOR_VOTING_ESCROW_ADDRESS,
                fn: () => katanaCDDemoVotingEscrowAddress,
            },
        ],
        meta: {
            votingEscrowAddress: katanaCDDemoVotingEscrowAddress,
        },
    },
    {
        plugin: katanaEmissionsTest,
        slotComponents: [
            {
                slotId: CapitalFlowDaoSlotId.CAPITAL_DISTRIBUTOR_MEMBERS_FILE_DOWNLOAD,
                component: CapitalDistributorTestMembersFileDownload,
            },
        ],
        slotFunctions: [
            {
                slotId: CapitalFlowDaoSlotId.CAPITAL_DISTRIBUTOR_VOTING_ESCROW_ADDRESS,
                fn: () => katanaEmissionsTestVotingEscrowAddress,
            },
        ],
        meta: {
            votingEscrowAddress: katanaEmissionsTestVotingEscrowAddress,
        },
    },
    {
        // TODO: Remove capitalDistributorTest when mainnet capital distributor is live (APP-558)
        plugin: capitalDistributorTestDao,
        slotComponents: [
            {
                slotId: CapitalFlowDaoSlotId.CAPITAL_DISTRIBUTOR_MEMBERS_FILE_DOWNLOAD,
                component: CapitalDistributorTestMembersFileDownload,
            },
        ],
        slotFunctions: [
            {
                slotId: CapitalFlowDaoSlotId.CAPITAL_DISTRIBUTOR_VOTING_ESCROW_ADDRESS,
                fn: () => capitalDistributorTestVotingEscrowAddress,
            },
        ],
        meta: {
            votingEscrowAddress: capitalDistributorTestVotingEscrowAddress,
        },
    },
    {
        plugin: katanaVKatManagement,
        slotComponents: [
            {
                slotId: CapitalFlowDaoSlotId.CAPITAL_DISTRIBUTOR_MEMBERS_FILE_DOWNLOAD,
                component: CapitalDistributorTestMembersFileDownload,
            },
        ],
    },
];
