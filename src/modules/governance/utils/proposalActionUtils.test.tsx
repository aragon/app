import { generateProposal } from '@/modules/governance/testUtils';
import { generateProposalActionChangeMembers } from '@/modules/governance/testUtils/generators/proposalActionChangeMembers';
import { generateProposalActionChangeSettings } from '@/modules/governance/testUtils/generators/proposalActionChangeSettings';
import { generateProposalActionWithdrawToken } from '@/modules/governance/testUtils/generators/proposalActionWithdrawToken';
import {
    proposalActionsUtils as ODSProposalActionUtils,
    ProposalActionType,
    type IProposalAction,
    type IProposalActionChangeMembers,
} from '@aragon/ods';
import proposalActionUtils from './proposalActionUtils';

describe('ProposalActionUtils', () => {
    it('should map known action types correctly', () => {
        const fetchedActions: IProposalAction[] = [
            generateProposalActionChangeMembers({ type: 'MultisigAddMembers' as IProposalActionChangeMembers['type'] }),
            generateProposalActionChangeSettings({ type: 'UpdateMultiSigSettings' }),
        ];
        const daoPlugins = ['multisig'];

        const daoId = '0x123';
        const proposal = generateProposal();

        const transformedActions = proposalActionUtils.normalizeActions(daoPlugins, fetchedActions, proposal, daoId);

        expect(transformedActions).toHaveLength(2);
        expect(transformedActions[0].type).toEqual(ProposalActionType.ADD_MEMBERS);
        expect(transformedActions[1].type).toEqual(ProposalActionType.CHANGE_SETTINGS_MULTISIG);
    });

    it('should normalize transfer actions correctly', () => {
        const fetchedActions: IProposalAction[] = [
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

        const daoId = '0x123';
        const proposal = generateProposal();

        const transformedActions = proposalActionUtils.normalizeActions([], fetchedActions, proposal, daoId);

        expect(transformedActions).toHaveLength(1);
        const action = transformedActions[0];

        if (ODSProposalActionUtils.isWithdrawTokenAction(action)) {
            expect(action.type).toEqual(ProposalActionType.WITHDRAW_TOKEN);
            expect(action.amount).toEqual('1');
        }
    });

    it('should normalize change settings actions correctly for multisig', () => {
        const fetchedActions: IProposalAction[] = [
            generateProposalActionChangeSettings({
                type: 'UpdateMultiSigSettings',
                proposedSettings: [{ term: 'someSetting', definition: 'new' }],
                existingSettings: [{ term: 'someSetting', definition: 'old' }],
            }),
        ];
        const daoPlugins = ['multisig'];

        const daoId = '0x123';
        const proposal = generateProposal();

        const transformedActions = proposalActionUtils.normalizeActions(daoPlugins, fetchedActions, proposal, daoId);

        expect(transformedActions).toHaveLength(1);
        const action = transformedActions[0];

        if (ODSProposalActionUtils.isChangeSettingsAction(action)) {
            expect(action.type).toEqual(ProposalActionType.CHANGE_SETTINGS_MULTISIG);
            expect(action.proposedSettings).toEqual([{ term: 'someSetting', definition: 'new' }]);
        }
    });

    it('should normalize change members actions correctly', () => {
        const fetchedActions = [
            generateProposalActionChangeMembers({
                type: 'MultisigAddMembers' as IProposalActionChangeMembers['type'],
                currentMembers: 4,
                members: [{ address: '0x3' }, { address: '0x4' }],
            }),
        ];

        const daoId = '0x123';
        const proposal = generateProposal();

        const transformedActions = proposalActionUtils.normalizeActions([], fetchedActions, proposal, daoId);

        expect(transformedActions).toHaveLength(1);
        const action = transformedActions[0];

        if (ODSProposalActionUtils.isChangeMembersAction(action)) {
            expect(action.type).toEqual(ProposalActionType.ADD_MEMBERS);
            expect(action.currentMembers).toEqual(4);
            expect(action.members).toHaveLength(2);
        }
    });

    it('should normalize change settings actions correctly for token-voting', () => {
        const fetchedActions: IProposalAction[] = [
            generateProposalActionChangeSettings({
                type: 'UpdateVoteSettings',
                proposedSettings: [{ term: 'votingPeriod', definition: '5 days' }],
                existingSettings: [{ term: 'votingPeriod', definition: '3 days' }],
            }),
        ];
        const daoPlugins = ['token-voting'];

        const daoId = '0x123';
        const proposal = generateProposal();

        const transformedActions = proposalActionUtils.normalizeActions(daoPlugins, fetchedActions, proposal, daoId);

        expect(transformedActions).toHaveLength(1);
        const action = transformedActions[0];

        if (ODSProposalActionUtils.isChangeSettingsAction(action)) {
            expect(action.type).toEqual(ProposalActionType.CHANGE_SETTINGS_TOKENVOTE);
            expect(action.proposedSettings).toEqual([{ term: 'votingPeriod', definition: '5 days' }]);
        }
    });

    it('should return a normal action when no specific case is met', () => {
        const fetchedActions: IProposalAction[] = [
            {
                type: 'UnknownType',
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

        const daoId = '0x123';
        const proposal = generateProposal();

        const transformedActions = proposalActionUtils.normalizeActions([], fetchedActions, proposal, daoId);

        expect(transformedActions).toHaveLength(1);
        const action = transformedActions[0];

        expect(action.type).toEqual(undefined);
        expect(action.inputData?.function).toEqual('settings');
    });

    it('should return a normal action when plugins do not match multisig or token-voting', () => {
        const fetchedActions: IProposalAction[] = [
            generateProposalActionChangeSettings({
                type: 'UpdateVoteSettings',
                proposedSettings: [{ term: 'votingPeriod', definition: '5 days' }],
                existingSettings: [{ term: 'votingPeriod', definition: '3 days' }],
            }),
        ];
        const daoPlugins = ['unknown-plugin'];

        const daoId = '0x123';
        const proposal = generateProposal();

        const transformedActions = proposalActionUtils.normalizeActions(daoPlugins, fetchedActions, proposal, daoId);

        expect(transformedActions).toHaveLength(1);
        const action = transformedActions[0];

        if (ODSProposalActionUtils.isChangeSettingsAction(action)) {
            expect(action.type).toEqual(ProposalActionType.CHANGE_SETTINGS_TOKENVOTE);
            expect(action.proposedSettings).toEqual([{ term: 'votingPeriod', definition: '5 days' }]);
        }
    });
});
