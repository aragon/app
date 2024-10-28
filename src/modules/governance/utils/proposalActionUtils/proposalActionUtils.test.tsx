import {
    generateProposal,
    generateProposalActionChangeMembers,
    generateProposalActionTokenMint,
    generateProposalActionUpdateMetadata,
    generateProposalActionWithdrawToken,
} from '@/modules/governance/testUtils';
import * as viem from 'viem';
import { formatUnits } from 'viem';
import { type ProposalActionType } from '../../api/governanceService';
import { proposalActionUtils } from './proposalActionUtils';

// Needed to spy formatUnits usage
jest.mock('viem', () => ({ __esModule: true, ...jest.requireActual('viem') }));

describe('proposalActionUtils', () => {
    const formatUnitsSpy = jest.spyOn(viem, 'formatUnits');

    afterEach(() => {
        formatUnitsSpy.mockReset();
    });

    it('normalizes a transfer action', () => {
        const baseAction = generateProposalActionWithdrawToken();

        const action = {
            ...baseAction,
            amount: '1000000000000000000',
            token: { ...baseAction.token, decimals: 18, symbol: 'DAI' },
            sender: { address: '0x9939393939234234234233' },
            receiver: { address: '0x9939393939334242342332' },
        };

        formatUnitsSpy.mockReturnValue('1.0');

        const result = proposalActionUtils.normalizeTransferAction(action);

        expect(result).toEqual({ ...action, type: 'WITHDRAW_TOKEN', amount: '1.0' });
        expect(formatUnits).toHaveBeenCalledWith(BigInt(action.amount), action.token.decimals);
    });

    it('normalizes a token mint action', () => {
        const baseAction = generateProposalActionTokenMint();

        const action = {
            ...baseAction,
            receivers: { ...baseAction.receivers, currentBalance: '1000000', newBalance: '20000000' },
        };

        formatUnitsSpy.mockReturnValueOnce('1.0').mockReturnValueOnce('2.0');

        const result = proposalActionUtils.normalizeTokenMintAction(action);

        const { receivers, token, ...otherValues } = action;

        expect(result).toEqual({
            ...otherValues,
            type: 'MINT',
            receiver: { address: receivers.address, currentBalance: '1.0', newBalance: '2.0' },
            tokenSymbol: token.symbol,
        });

        expect(formatUnits).toHaveBeenNthCalledWith(1, BigInt(action.receivers.currentBalance), action.token.decimals);
        expect(formatUnits).toHaveBeenNthCalledWith(2, BigInt(action.receivers.newBalance), action.token.decimals);
    });

    it('normalizes a change members action', () => {
        const action = { ...generateProposalActionChangeMembers(), currentMembers: [{ address: '0xMemberAddress' }] };
        const result = proposalActionUtils.normalizeChangeMembersAction(action);
        expect(result).toEqual({ ...action, type: 'ADD_MEMBERS', currentMembers: 1 });
    });

    it('normalizes an update metadata action', () => {
        const baseAction = generateProposalActionUpdateMetadata();
        const { proposedMetadata, existingMetadata } = baseAction;

        const action = {
            ...baseAction,
            proposedMetadata: { ...proposedMetadata, links: [{ name: 'Link1', url: 'https://link1.com' }] },
            existingMetadata: {
                ...existingMetadata,
                logo: 'test.png',
                links: [{ name: 'Link2', url: 'https://link2.com' }],
            },
        };

        const result = proposalActionUtils.normalizeUpdateMetaDataAction(action);

        expect(result).toEqual({
            ...action,
            type: 'UPDATE_METADATA',
            proposedMetadata: {
                ...action.proposedMetadata,
                logo: '',
                links: [{ label: 'Link1', href: 'https://link1.com' }],
            },
            existingMetadata: { ...action.existingMetadata, links: [{ label: 'Link2', href: 'https://link2.com' }] },
        });
    });

    it('returns unmodified action if type does not match any known action', () => {
        const action = { ...generateProposalActionWithdrawToken(), type: 'UNKNOWN_TYPE' as ProposalActionType };
        const proposal = generateProposal({ actions: [action] });

        const result = proposalActionUtils.normalizeActions({ proposal, daoId: 'daoId' });

        expect(result).toEqual([action]);
    });
});
