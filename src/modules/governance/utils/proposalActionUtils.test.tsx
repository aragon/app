import { ProposalActionType } from '@/modules/governance/api/governanceService';
import { generateProposal } from '@/modules/governance/testUtils';
import { generateProposalActionChangeMembers } from '@/modules/governance/testUtils/generators/proposalActionChangeMembers';
import { generateProposalActionChangeSettings } from '@/modules/governance/testUtils/generators/proposalActionChangeSettings';
import { generateProposalActionWithdrawToken } from '@/modules/governance/testUtils/generators/proposalActionWithdrawToken';
import { type IProposalAction } from '@aragon/ods';
import proposalActionUtils from './proposalActionUtils';

describe('ProposalActionUtils', () => {
    it('should map known action types correctly', () => {
        const actions: IProposalAction[] = [
            generateProposalActionChangeMembers({ type: ProposalActionType.MULTISIG_ADD_MEMBERS }),
            generateProposalActionChangeSettings({ type: ProposalActionType.UPDATE_MULTISIG_SETTINGS }),
        ];
        const plugins = ['multisig'];

        const daoId = '0x123';
        const proposal = generateProposal();

        const transformedActions = proposalActionUtils.normalizeActions({ plugins, actions, proposal, daoId });

        expect(transformedActions).toHaveLength(2);
        expect(transformedActions[0].type).toEqual('ADD_MEMBERS');
        expect(transformedActions[1].type).toEqual('CHANGE_SETTINGS_MULTISIG');
    });

    it('should normalize transfer actions correctly', () => {
        const actions: IProposalAction[] = [
            generateProposalActionWithdrawToken({
                amount: '1000000000000000000',
                token: {
                    name: 'Token Name',
                    symbol: 'TKN',
                    decimals: 18,
                    logo: 'token-logo.png',
                    priceUsd: '1.00',
                    address: '0x1234567890',
                },
            }),
        ];
        const plugins = [''];
        const daoId = '0x123';
        const proposal = generateProposal();

        const transformedActions = proposalActionUtils.normalizeActions({ plugins, actions, proposal, daoId });

        expect(transformedActions).toHaveLength(1);
        const action = transformedActions[0];

        if (proposalActionUtils.isWithdrawTokenAction(action)) {
            expect(action.type).toEqual('WITHDRAW_TOKEN');
            expect(action.amount).toEqual('1');
        }
    });

    it('should normalize change settings actions correctly for multisig', () => {
        const actions: IProposalAction[] = [
            generateProposalActionChangeSettings({
                type: ProposalActionType.UPDATE_MULTISIG_SETTINGS,
                proposedSettings: [{ term: 'someSetting', definition: 'new' }],
                existingSettings: [{ term: 'someSetting', definition: 'old' }],
            }),
        ];
        const plugins = ['multisig'];

        const daoId = '0x123';
        const proposal = generateProposal();

        const transformedActions = proposalActionUtils.normalizeActions({ plugins, actions, proposal, daoId });

        expect(transformedActions).toHaveLength(1);
        const action = transformedActions[0];

        if (proposalActionUtils.isChangeSettingsAction(action)) {
            expect(action.type).toEqual('CHANGE_SETTINGS_MULTISIG');
            expect(action.proposedSettings).toEqual([{ term: 'someSetting', definition: 'new' }]);
        }
    });

    it('should normalize change members actions correctly', () => {
        const actions = [
            generateProposalActionChangeMembers({
                type: ProposalActionType.MULTISIG_ADD_MEMBERS,
                currentMembers: [{ address: '0x1' }, { address: '0x2' }, { address: '0x3' }, { address: '0x4' }],
                members: [{ address: '0x3' }, { address: '0x4' }],
            }),
        ];

        const plugins = [''];
        const daoId = '0x123';
        const proposal = generateProposal();

        const transformedActions = proposalActionUtils.normalizeActions({ plugins, actions, proposal, daoId });

        expect(transformedActions).toHaveLength(1);
        const action = transformedActions[0];

        if (proposalActionUtils.isChangeMembersAction(action)) {
            expect(action.type).toEqual('ADD_MEMBERS');
            expect(action.currentMembers).toEqual(4);
            expect(action.members).toHaveLength(2);
        }
    });

    it('should normalize change settings actions correctly for token-voting', () => {
        const actions: IProposalAction[] = [
            generateProposalActionChangeSettings({
                type: ProposalActionType.UPDATE_VOTE_SETTINGS,
                proposedSettings: [{ term: 'votingPeriod', definition: '5 days' }],
                existingSettings: [{ term: 'votingPeriod', definition: '3 days' }],
            }),
        ];
        const plugins = ['token-voting'];

        const daoId = '0x123';
        const proposal = generateProposal();

        const transformedActions = proposalActionUtils.normalizeActions({ plugins, actions, proposal, daoId });

        expect(transformedActions).toHaveLength(1);
        const action = transformedActions[0];

        if (proposalActionUtils.isChangeSettingsAction(action)) {
            expect(action.type).toEqual('CHANGE_SETTINGS_TOKENVOTE');
            expect(action.proposedSettings).toEqual([{ term: 'votingPeriod', definition: '5 days' }]);
        }
    });

    it('should return a normal action when no specific case is met', () => {
        const actions: IProposalAction[] = [
            {
                type: 'UnknownType' as ProposalActionType,
                from: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e',
                to: '0x3f5CE5FBFe3E9af3971dD833D26BA9b5C936F0bE',
                data: '',
                value: '1000000',
                inputData: {
                    function: 'settings',
                    contract: 'GovernanceERC20',
                    parameters: [
                        { type: 'address', value: '0x3f5CE5FBFe3E9af3971dD833D26BA9b5C936F0bE' },
                        { type: 'uint256', value: '1000000000000000000' },
                    ],
                },
            } as IProposalAction,
        ];
        const plugins = [''];
        const daoId = '0x123';
        const proposal = generateProposal();

        const transformedActions = proposalActionUtils.normalizeActions({ plugins, actions, proposal, daoId });

        expect(transformedActions).toHaveLength(1);
        const action = transformedActions[0];

        // Check that the normal action is returned as-is
        expect(action.type).toEqual('UnknownType');
        expect(action.inputData?.function).toEqual('settings');
    });

    it('should return a normal action when plugins do not match multisig or token-voting', () => {
        const actions: IProposalAction[] = [
            generateProposalActionChangeSettings({
                type: ProposalActionType.UPDATE_VOTE_SETTINGS,
                proposedSettings: [{ term: 'votingPeriod', definition: '5 days' }],
                existingSettings: [{ term: 'votingPeriod', definition: '3 days' }],
            }),
        ];
        const plugins = ['unknown-plugin'];

        const daoId = '0x123';
        const proposal = generateProposal();

        const transformedActions = proposalActionUtils.normalizeActions({ plugins, actions, proposal, daoId });

        expect(transformedActions).toHaveLength(1);
        const action = transformedActions[0];

        if (proposalActionUtils.isChangeSettingsAction(action)) {
            expect(action.type).toEqual('CHANGE_SETTINGS_TOKENVOTE');
            expect(action.proposedSettings).toEqual([{ term: 'votingPeriod', definition: '5 days' }]);
        }
    });
});
