import { Network } from '@/shared/api/daoService';
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
    describe('getProposalUrl', () => {
        const network = Network.ETHEREUM_SEPOLIA;
        const daoAddress = '0xE8fd9Fe445A037ee07fb98FDD4b146d939140De5';
        const linkedAddress = '0xA941b1C1D9aDC88C9241aA3ACA59E8B8f0386419';

        // The proposal generator defaults to a different DAO address, which reads as a linked account — so the
        // same-DAO cases have to line the proposal up with the DAO explicitly.
        const setupSameDaoProposal = () => {
            getDaoPluginsSpy.mockReturnValue([
                generateDaoPlugin({ slug: 'plugin-slug' }),
            ]);

            return generateProposal({
                incrementalId: 1,
                pluginAddress: '0x1',
                daoAddress,
                network,
            });
        };

        const setupLinkedAccountProposal = () => {
            getDaoPluginsSpy.mockReturnValue([
                generateDaoPlugin({ slug: 'plugin-slug' }),
            ]);

            return generateProposal({
                incrementalId: 1,
                pluginAddress: '0x1',
                daoAddress: linkedAddress,
                network: Network.ETHEREUM_MAINNET,
            });
        };

        const buildDao = () =>
            generateDao({
                id: `${network}-${daoAddress}`,
                network,
                address: daoAddress,
                ens: null,
            });

        it('links a proposal to the DAO pages', () => {
            const result = proposalUtils.getProposalUrl(
                setupSameDaoProposal(),
                buildDao(),
            );
            expect(result).toEqual(
                `/dao/${network}/${daoAddress}/proposals/PLUGIN-SLUG-1`,
            );
        });

        it('links a linked-account proposal to the page of the account it belongs to', () => {
            const result = proposalUtils.getProposalUrl(
                setupLinkedAccountProposal(),
                buildDao(),
            );
            expect(result).toEqual(
                `/dao/${Network.ETHEREUM_MAINNET}/${linkedAddress}/proposals/PLUGIN-SLUG-1`,
            );
        });

        // Guards the contract that the workspace support is purely additive: the DAO pages pass no base URL and
        // must keep getting the exact URL they got before it existed.
        it('returns the same URL whether the base URL is omitted or undefined', () => {
            const proposal = setupSameDaoProposal();
            const dao = buildDao();
            const expected = `/dao/${network}/${daoAddress}/proposals/PLUGIN-SLUG-1`;
            expect(proposalUtils.getProposalUrl(proposal, dao)).toEqual(
                expected,
            );
            expect(
                proposalUtils.getProposalUrl(proposal, dao, undefined),
            ).toEqual(expected);
        });

        it('links a proposal under the base URL when one is set', () => {
            const result = proposalUtils.getProposalUrl(
                setupSameDaoProposal(),
                buildDao(),
                '/workspace/demo',
            );
            expect(result).toEqual(
                `/workspace/demo/proposals/${network}-${daoAddress}/PLUGIN-SLUG-1`,
            );
            expect(result).not.toContain('/dao/');
        });

        it('links a linked-account proposal under the base URL to the account it belongs to', () => {
            const result = proposalUtils.getProposalUrl(
                setupLinkedAccountProposal(),
                buildDao(),
                '/workspace/demo',
            );
            expect(result).toEqual(
                `/workspace/demo/proposals/${Network.ETHEREUM_MAINNET}-${linkedAddress}/PLUGIN-SLUG-1`,
            );
            expect(result).not.toContain('/dao/');
        });

        it('returns undefined when the plugin cannot be resolved, with or without a base URL', () => {
            getDaoPluginsSpy.mockReturnValue(undefined);
            const proposal = generateProposal({ pluginAddress: '0x1' });
            const dao = buildDao();
            expect(proposalUtils.getProposalUrl(proposal, dao)).toBeUndefined();
            expect(
                proposalUtils.getProposalUrl(proposal, dao, '/workspace/demo'),
            ).toBeUndefined();
        });
    });
});
