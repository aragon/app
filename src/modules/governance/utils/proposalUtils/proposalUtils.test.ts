import { generateDao, generateDaoPlugin } from '@/shared/testUtils';
import { daoUtils } from '@/shared/utils/daoUtils';
import { generateProposal } from '../../testUtils';
import { proposalUtils } from './proposalUtils';

describe('proposalUtils', () => {
    const getDaoPluginsSpy = jest.spyOn(daoUtils, 'getDaoPlugins');

    afterEach(() => {
        getDaoPluginsSpy.mockReset();
    });

    describe('getProposalSlug', () => {
        it('returns undefined when plugin is not found', () => {
            getDaoPluginsSpy.mockReturnValue(undefined);
            const result = proposalUtils.getProposalSlug(generateProposal());
            expect(result).toBeUndefined();
        });

        it('returns the correct proposal slug', () => {
            const dao = generateDao();
            const proposal = generateProposal({
                incrementalId: 1,
                pluginAddress: '0x123',
            });
            const plugin = generateDaoPlugin({ slug: 'plugin-slug' });
            getDaoPluginsSpy.mockReturnValue([plugin]);
            const result = proposalUtils.getProposalSlug(proposal, dao);
            expect(getDaoPluginsSpy).toHaveBeenCalledWith(dao, {
                pluginAddress: proposal.pluginAddress,
                includeSubPlugins: true,
            });
            expect(result).toEqual('PLUGIN-SLUG-1');
        });
    });
});
