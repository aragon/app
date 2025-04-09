import { generateDaoPlugin } from '@/shared/testUtils';
import { generateProposalActionWithdrawToken } from '@aragon/gov-ui-kit';
import { proposalUtils } from './proposalUtils';

describe('proposalUtils', () => {
    describe('getProposalSlug', () => {
        it('throws an error if incrementalId is not provided', () => {
            const plugin = generateDaoPlugin();
            expect(() => proposalUtils.getProposalSlug(undefined, plugin)).toThrow();
        });

        it('throws an error if plugin is not provided', () => {
            const incrementalId = 1;
            expect(() => proposalUtils.getProposalSlug(incrementalId, undefined)).toThrow();
        });

        it('returns the correct proposal slug', () => {
            const incrementalId = 1;
            const plugin = generateDaoPlugin({ slug: 'plugin-slug' });
            const result = proposalUtils.getProposalSlug(incrementalId, plugin);
            expect(result).toBe('PLUGIN-SLUG-1');
        });
    });

    describe('proposalActionToTransactionRequest', () => {
        it('correctly maps a proposal action to a transaction request', () => {
            const actionBaseData = { to: '0x123', value: '10', data: '0x1234' };
            const action = generateProposalActionWithdrawToken(actionBaseData);
            expect(proposalUtils.actionToTransactionRequest(action)).toEqual({
                ...actionBaseData,
                value: BigInt(actionBaseData.value),
            });
        });
    });
});
