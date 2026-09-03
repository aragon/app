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
            const proposal = generateProposal({
                title: 'my-proposal',
                description: '',
            });
            const result = proposalUtils.getMetadataStatus(proposal);
            expect(result).toEqual(ProposalMetadataStatus.STANDARD);
        });

        it('returns standard when only the proposal description is set', () => {
            const proposal = generateProposal({
                title: '',
                description: 'my-description',
            });
            const result = proposalUtils.getMetadataStatus(proposal);
            expect(result).toEqual(ProposalMetadataStatus.STANDARD);
        });

        it('returns non-standard when title and description are not set and the metadata is a raw string', () => {
            const proposal = generateProposal({
                title: '',
                description: '',
                metadataUri: 'Proposal to change the settings',
            });
            const result = proposalUtils.getMetadataStatus(proposal);
            expect(result).toEqual(ProposalMetadataStatus.NON_STANDARD);
        });

        it.each([null, '', '  ', 'ipfs://unresolvable-cid'])(
            'returns missing when title and description are not set and the metadata is %s',
            (metadataUri) => {
                const proposal = generateProposal({
                    title: '',
                    description: '',
                    metadataUri,
                });
                const result = proposalUtils.getMetadataStatus(proposal);
                expect(result).toEqual(ProposalMetadataStatus.MISSING);
            },
        );
    });

    describe('getDisplayTitle', () => {
        it('returns the proposal title when set', () => {
            const proposal = generateProposal({ title: 'my-proposal' });
            const result = proposalUtils.getDisplayTitle(proposal, 'admin-1');
            expect(result).toEqual('my-proposal');
        });

        it('falls back to the uppercased proposal slug when the title is not set', () => {
            const proposal = generateProposal({ title: '' });
            const result = proposalUtils.getDisplayTitle(proposal, 'admin-1');
            expect(result).toEqual('ADMIN-1');
        });

        it('returns an empty title when neither the title nor the slug are set', () => {
            const proposal = generateProposal({ title: '' });
            expect(proposalUtils.getDisplayTitle(proposal)).toEqual('');
        });

        it('returns the proposal title when the slug is not set', () => {
            const proposal = generateProposal({ title: 'my-proposal' });
            expect(proposalUtils.getDisplayTitle(proposal)).toEqual(
                'my-proposal',
            );
        });
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
