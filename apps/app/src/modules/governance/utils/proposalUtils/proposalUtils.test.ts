import { generateDao, generateDaoPlugin } from '@/shared/testUtils';
import { daoUtils } from '@/shared/utils/daoUtils';
import { generateProposal } from '../../testUtils';
import { ProposalMetadataStatus, proposalUtils } from './proposalUtils';

describe('proposalUtils', () => {
    const getDaoPluginsSpy = jest.spyOn(daoUtils, 'getDaoPlugins');

    afterEach(() => {
        getDaoPluginsSpy.mockReset();
    });

    describe('getMetadataStatus', () => {
        it('returns standard when the proposal title is set', () => {
            const proposal = generateProposal({ title: 'my-proposal' });
            const result = proposalUtils.getMetadataStatus(proposal);
            expect(result).toEqual(ProposalMetadataStatus.STANDARD);
        });

        it('returns non-standard when the title is not set and the metadata is a raw string', () => {
            const proposal = generateProposal({
                title: '',
                metadataUri: 'Proposal to change the settings',
            });
            const result = proposalUtils.getMetadataStatus(proposal);
            expect(result).toEqual(ProposalMetadataStatus.NON_STANDARD);
        });

        it.each([null, '', '  ', 'ipfs://unresolvable-cid'])(
            'returns missing when the title is not set and the metadata is %s',
            (metadataUri) => {
                const proposal = generateProposal({ title: '', metadataUri });
                const result = proposalUtils.getMetadataStatus(proposal);
                expect(result).toEqual(ProposalMetadataStatus.MISSING);
            },
        );
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
                includeLinkedAccounts: true,
            });
            expect(result).toEqual('PLUGIN-SLUG-1');
        });
    });
});
