import {
    ProposalActionType,
    type IProposal,
    type IProposalActionChangeMembers,
    type IProposalActionChangeSettings,
    type IProposalActionWithdrawToken,
} from '@/modules/governance/api/governanceService';
import {
    generateProposalActionChangeMembers,
    generateProposalActionTokenMint,
    generateProposalActionUpdateMetadata,
} from '@/modules/governance/testUtils';
import { pluginRegistryUtils } from '@/shared/utils/pluginRegistryUtils';
import { type IProposalAction } from '@aragon/ods';
import { formatUnits } from 'viem';
import { proposalActionUtils } from '.';

jest.mock('viem', () => ({
    formatUnits: jest.fn(),
}));

describe('proposalAction utils', () => {
    const daoId = 'test-dao-id';
    const plugins = ['plugin1', 'plugin2'];
    const proposal = {
        settings: {},
    } as unknown as IProposal;

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('normalizes a transfer action', () => {
        const action: IProposalActionWithdrawToken = {
            type: ProposalActionType.TRANSFER,
            amount: '1000000000000000000',
            token: {
                decimals: 18,
                symbol: 'DAI',
                name: '',
                logo: '',
                priceUsd: '',
                address: '',
            },
            sender: { address: '0x9939393939234234234233' },
            receiver: { address: '0x9939393939334242342332' },
            from: '',
            to: '',
            data: '',
            value: '',
            inputData: null,
        };

        (formatUnits as jest.Mock).mockReturnValue('1.0');

        const result = proposalActionUtils.normalizeTransferAction(action);

        expect(result).toEqual({
            ...action,
            type: 'WITHDRAW_TOKEN',
            amount: '1.0',
        });
        expect(formatUnits).toHaveBeenCalledWith(BigInt(action.amount), action.token.decimals);
    });

    it('normalizes a change settings action', () => {
        const action: IProposalActionChangeSettings = {
            type: ProposalActionType.UPDATE_MULTISIG_SETTINGS,
            proposedSettings: {
                settings: {
                    minApprovals: 0,
                    onlyListed: false,
                },
                id: '',
                pluginAddress: '',
                pluginSubdomain: '',
            },
            from: '',
            to: '',
            data: '',
            value: '',
            inputData: null,
        };

        jest.spyOn(pluginRegistryUtils, 'getPlugin').mockReturnValue({ id: 'plugin-id', name: 'plugin-name' }); // Mock the plugin existence
        jest.spyOn(pluginRegistryUtils, 'getSlotFunction').mockReturnValue(() => ({ parsed: 'parsed' })); // Mock the parsing function

        const result = proposalActionUtils.normalizeChangeSettingsAction(action, plugins, proposal, daoId);

        expect(result).toEqual({
            ...action,
            type: 'CHANGE_SETTINGS_MULTISIG',
            existingSettings: { parsed: 'parsed' },
            proposedSettings: { parsed: 'parsed' },
        });
    });

    it('normalizes a change members action', () => {
        const action: IProposalActionChangeMembers = generateProposalActionChangeMembers();
        const result = proposalActionUtils.normalizeChangeMembersAction(action);

        expect(result).toEqual({
            ...action,
            type: 'ADD_MEMBERS',
            currentMembers: 1,
        });
    });

    it('normalizes an update metadata action', () => {
        const action = generateProposalActionUpdateMetadata({
            proposedMetadata: {
                logo: '',
                name: '',
                description: '',
                links: [{ name: 'Link1', url: 'https://link1.com' }],
            },
            existingMetadata: {
                logo: '',
                name: '',
                description: '',
                links: [{ name: 'Link2', url: 'https://link2.com' }],
            },
        });

        const result = proposalActionUtils.normalizeUpdateMetaDataAction(action);

        expect(result).toEqual({
            ...action,
            type: 'UPDATE_METADATA',
            proposedMetadata: {
                logo: '',
                name: '',
                description: '',
                links: [{ label: 'Link1', href: 'https://link1.com' }],
            },
            existingMetadata: {
                logo: '',
                name: '',
                description: '',
                links: [{ label: 'Link2', href: 'https://link2.com' }],
            },
        });
    });

    it('normalizes a token mint action', () => {
        const action = generateProposalActionTokenMint({
            receivers: { address: '0x1', currentBalance: 1000000, newBalance: 20000000 },
        });

        const result = proposalActionUtils.normalizeTokenMintAction(action);

        const { token, ...otherValues } = action;

        expect(result).toEqual({
            ...otherValues,
            type: 'TOKEN_MINT',
            receivers: [
                {
                    address: action.receivers.address,
                    currentBalance: action.receivers.currentBalance,
                    newBalance: action.receivers.newBalance,
                },
            ],
            tokenSymbol: token.symbol,
        });
    });

    it('returns unmodified action if type does not match any known action', () => {
        const action: IProposalAction = {
            type: 'UNKNOWN_TYPE',
        } as IProposalAction;

        const result = proposalActionUtils.normalizeActions({
            actions: [action],
            plugins,
            proposal,
            daoId,
        });

        expect(result).toEqual([action]);
    });
});
