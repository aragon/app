import { SppProposalType } from '@/plugins/sppPlugin/types';
import { AragonBackendService, type IPaginatedResponse } from '@/shared/api/aragonBackendService';
import { Network } from '@/shared/api/daoService';
import { daoMock } from '@/shared/api/daoService/daoService';
import type { IMember, IProposal, IVote } from './domain';
import type {
    IGetMemberListParams,
    IGetMemberParams,
    IGetProposalListParams,
    IGetProposalParams,
    IGetVoteListParams,
} from './governanceService.api';
import { DaoTokenVotingMode, VoteOption } from '@/plugins/tokenPlugin/types';

// TODO: Remove these mocks when we have all data from backend for SPP proposals
const mockSppProposal = {
    id: '1',
    proposalIndex: '0',
    title: 'title',
    startDate: 0,
    endDate: 1234567890,
    summary: 'summary',
    lastStageTransition: 0,
    creator: {
        address: '0x51cc608e50D59885009522e1b6307E72A9ECfa2c',
        ens: null,
        avatar: null,
    },
    blockTimestamp: 0,
    description: 'description',
    daoAddress: '0x123',
    transactionHash: '0x123',
    resources: [],
    network: Network.ARBITRUM_MAINNET,
    executed: { status: false },
    actions: [],
    pluginAddress: '0x123',
    pluginSubdomain: 'spp',
    currentStageIndex: 0,
    subProposals: [
        {
            proposalIndex: '0',
            title: 'title',
            startDate: 0,
            endDate: 1234567890,
            summary: 'summary',
            creator: {
                address: '0x51cc608e50D59885009522e1b6307E72A9ECfa2c',
                ens: null,
                avatar: null,
            },
            metrics: {
                proposalsCreated: 0,
                members: 0,
                tvlUSD: '0',
                votesByOption: [
                    { type: VoteOption.YES, totalVotingPower: '447190' },
                    { type: VoteOption.NO, totalVotingPower: '4818' },
                ],
            },
            description: 'description',
            daoAddress: '0x123',
            transactionHash: '0x123',
            resources: [],
            network: Network.ARBITRUM_MAINNET,
            settings: {
                votingMode: DaoTokenVotingMode.EARLY_EXECUTION,
                supportThreshold: 0,
                minDuration: 0,
                minParticipation: 300000000,
                minProposerVotingPower: '0',
                historicalTotalSupply: '100000000',
                token: {
                    address: '0xTestAddress',
                    network: Network.ETHEREUM_MAINNET,
                    symbol: 'ETH',
                    logo: 'https://test.com',
                    name: 'Ethereum',
                    type: 'ERC-20',
                    decimals: 0,
                    priceChangeOnDayUsd: '0.00',
                    priceUsd: '0.00',
                    totalSupply: '0',
                },
            },
            executed: { status: false },
            actions: [],
            pluginAddress: '0x123',

            id: '0x63d7ccd4a6a761b1522cfef87896566cb9c04540198d3b77605487a6eb679469-0xCa6f5bd946F52298a7B6154fc827bF87512a15F3-7',
            pluginSubdomain: 'token-voting',
            blockTimestamp: 1726153572,

            stageId: '0',
        },
    ],
    settings: {
        stages: [
            {
                id: '0',
                name: 'Token holder voting',
                plugins: [{ ...daoMock.plugins[2], proposalType: SppProposalType.APPROVAL }],
                votingPeriod: 432000,
                maxAdvance: 1,
                minAdvance: 1,
                approvalThreshold: 0.5,
                vetoThreshold: 0.1,
            },
            {
                id: '1',
                name: 'Founders approval',
                plugins: [{ ...daoMock.plugins[1], proposalType: SppProposalType.VETO }],
                votingPeriod: 604800,
                maxAdvance: 1,
                minAdvance: 1,
                approvalThreshold: 0.5,
                vetoThreshold: 0.1,
            },
        ],
    },
};

class GovernanceService extends AragonBackendService {
    private urls = {
        members: '/members',
        member: '/members/:address',
        proposals: '/proposals',
        proposal: '/proposals/:id',
        votes: '/votes',
    };

    getMemberList = async <TMember extends IMember = IMember>(
        params: IGetMemberListParams,
    ): Promise<IPaginatedResponse<TMember>> => {
        const result = await this.request<IPaginatedResponse<TMember>>(this.urls.members, params);

        return result;
    };

    getMember = async <TMember extends IMember = IMember>(params: IGetMemberParams): Promise<TMember> => {
        const result = await this.request<TMember>(this.urls.member, params);

        return result;
    };

    getProposalList = async <TProposal extends IProposal = IProposal>(
        params: IGetProposalListParams,
    ): Promise<IPaginatedResponse<TProposal>> => {
        const result = await this.request<IPaginatedResponse<TProposal>>(this.urls.proposals, params);

        return result;
    };

    getProposal = async <TProposal extends IProposal = IProposal>(params: IGetProposalParams): Promise<TProposal> => {
        const result = await this.request<TProposal>(this.urls.proposal, params);

        // TODO: Remove this when we have all data from backend for SPP proposals
        if (
            result.id ===
            '0x94beaf110a7e02986e8d4dae097ca6de26c97c42d90b42014c1f0936c679b5aa-0xA2Dee0b38d2CfaDeb52F2B5A738b5Ea7E037DCe9-48'
        ) {
            return mockSppProposal as unknown as TProposal;
        }

        return result;
    };

    getVoteList = async <TVote extends IVote = IVote>(
        params: IGetVoteListParams,
    ): Promise<IPaginatedResponse<TVote>> => {
        const result = await this.request<IPaginatedResponse<TVote>>(this.urls.votes, params);

        return result;
    };
}

export const governanceService = new GovernanceService();
