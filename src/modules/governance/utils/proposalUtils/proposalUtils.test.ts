import { generateDaoPlugin } from '@/shared/testUtils';
import { proposalUtils } from './proposalUtils';

describe('proposalUtils', () => {
    describe('getProposalSlug', () => {
        it('should throw an error if incrementalId is not provided', () => {
            const plugin = generateDaoPlugin();
            expect(() => proposalUtils.getProposalSlug(undefined, plugin)).toThrow();
        });

        it('should throw an error if plugin is not provided', () => {
            const incrementalId = 1;
            expect(() => proposalUtils.getProposalSlug(incrementalId, undefined)).toThrow();
        });

        it('should return the correct proposal slug', () => {
            const incrementalId = 1;
            const plugin = generateDaoPlugin({ slug: 'plugin-slug' });
            const result = proposalUtils.getProposalSlug(incrementalId, plugin);
            expect(result).toBe('PLUGIN-SLUG-1');
        });
    });
});
