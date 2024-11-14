import {
    generateProposalActionUpdateMetadata,
    generateProposalActionWithdrawToken,
} from '@/modules/governance/testUtils';
import * as viem from 'viem';
import { formatUnits } from 'viem';
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
});
