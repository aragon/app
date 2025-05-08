import { generateToken } from '@/modules/finance/testUtils';
import {
    generateProposalAction,
    generateProposalActionUpdateMetadata,
    generateProposalActionUpdatePluginMetadata,
    generateProposalActionWithdrawToken,
} from '@/modules/governance/testUtils';
import { generateDao } from '@/shared/testUtils';
import { ipfsUtils } from '@/shared/utils/ipfsUtils';
import { pluginRegistryUtils } from '@/shared/utils/pluginRegistryUtils';
import {
    type IProposalActionUpdateMetadata,
    type IProposalActionWithdrawToken,
    ProposalActionType as GukProposalActionType,
} from '@aragon/gov-ui-kit';
import { ProposalActionType } from '../../api/governanceService';
import { proposalActionUtils } from './proposalActionUtils';

describe('proposalActionUtils', () => {
    const getSlotFunctionsSpy = jest.spyOn(pluginRegistryUtils, 'getSlotFunctions');
    const ipfsCidToSrcSpy = jest.spyOn(ipfsUtils, 'cidToSrc');

    afterEach(() => {
        getSlotFunctionsSpy.mockReset();
        ipfsCidToSrcSpy.mockReset();
    });

    describe('normalizeActions', () => {
        const normalizeDefaultActionSpy = jest.spyOn(proposalActionUtils, 'normalizeDefaultAction');

        afterEach(() => {
            normalizeDefaultActionSpy.mockReset();
        });

        afterAll(() => {
            normalizeDefaultActionSpy.mockRestore();
        });

        it('retrieves and triggers all plugin-specific normalization functions to normalize the proposal actions', () => {
            const dao = generateDao({ id: 'test' });
            const actions = [generateProposalAction()];
            const normalizationFunctionOne = jest.fn(() => actions);
            const normalizationFunctionTwo = jest.fn(() => actions);
            getSlotFunctionsSpy.mockReturnValue([normalizationFunctionOne, normalizationFunctionTwo]);
            proposalActionUtils.normalizeActions(actions, dao);
            const expectedParams = { actions, daoId: dao.id };
            expect(normalizationFunctionOne).toHaveBeenCalledWith(expectedParams);
            expect(normalizationFunctionTwo).toHaveBeenCalledWith(expectedParams);
        });

        it('triggers the default normalization function with the result of the plugin-specific normalization function', () => {
            const normalizedActions = [generateProposalAction({ type: '1' }), generateProposalAction({ type: '2' })];
            const pluginNormalizationFunction = () => normalizedActions;
            getSlotFunctionsSpy.mockReturnValue([pluginNormalizationFunction]);
            proposalActionUtils.normalizeActions([], generateDao());
            expect(normalizeDefaultActionSpy).toHaveBeenNthCalledWith(1, normalizedActions[0]);
            expect(normalizeDefaultActionSpy).toHaveBeenNthCalledWith(2, normalizedActions[1]);
        });
    });

    describe('normalizeDefaultAction', () => {
        const normalizeTransferActionSpy = jest.spyOn(proposalActionUtils, 'normalizeTransferAction');
        const normalizeUpdateMetaDataActionSpy = jest.spyOn(proposalActionUtils, 'normalizeUpdateMetaDataAction');

        afterEach(() => {
            normalizeTransferActionSpy.mockReset();
            normalizeUpdateMetaDataActionSpy.mockReset();
        });

        afterAll(() => {
            normalizeTransferActionSpy.mockRestore();
            normalizeUpdateMetaDataActionSpy.mockRestore();
        });

        it('uses the transfer-action normalization function when action is of transfer type', () => {
            const action = generateProposalAction({ type: ProposalActionType.TRANSFER });
            const normalizedAction = generateProposalAction({ type: 'normalized' });
            normalizeTransferActionSpy.mockReturnValue(normalizedAction as IProposalActionWithdrawToken);
            expect(proposalActionUtils.normalizeDefaultAction(action)).toEqual(normalizedAction);
            expect(normalizeTransferActionSpy).toHaveBeenCalledWith(action);
        });

        it('uses the update-metadata-action normalization function when action is of update-metadata type', () => {
            const action = generateProposalAction({ type: ProposalActionType.METADATA_UPDATE });
            const normalizedAction = generateProposalAction({ type: 'normalized' });
            normalizeUpdateMetaDataActionSpy.mockReturnValue(normalizedAction as IProposalActionUpdateMetadata);
            expect(proposalActionUtils.normalizeDefaultAction(action)).toEqual(normalizedAction);
            expect(normalizeUpdateMetaDataActionSpy).toHaveBeenCalledWith(action);
        });

        it('returns the action as it is when type does not match any handled type', () => {
            const action = generateProposalAction({ type: 'plugin-action' });
            expect(proposalActionUtils.normalizeDefaultAction(action)).toEqual(action);
        });
    });

    describe('normalizeTransferAction', () => {
        it('correctly normalizes a transfer action', () => {
            const token = generateToken({ decimals: 18 });
            const transferAction = generateProposalActionWithdrawToken({ amount: '1000000000000000', token });
            const normalizedAction = proposalActionUtils.normalizeTransferAction(transferAction);
            expect(normalizedAction.type).toEqual(GukProposalActionType.WITHDRAW_TOKEN);
            expect(normalizedAction.amount).toEqual('0.001');
            expect(normalizedAction.sender).toEqual(transferAction.sender);
        });
    });

    describe('normalizeUpdateMetaDataAction', () => {
        const normalizeActionMetadataSpy = jest.spyOn(proposalActionUtils, 'normalizeActionMetadata');

        afterEach(() => {
            normalizeActionMetadataSpy.mockReset();
        });

        afterAll(() => {
            normalizeActionMetadataSpy.mockRestore();
        });

        it('correctly normalizes a update-dao-metadata action', () => {
            const action = generateProposalActionUpdateMetadata();
            const normalizedMetadata = { name: 'test-name', description: 'test-description', links: [] };
            normalizeActionMetadataSpy.mockReturnValue(normalizedMetadata);
            const normalizedAction = proposalActionUtils.normalizeUpdateMetaDataAction(action);
            expect(normalizedAction.type).toEqual(GukProposalActionType.UPDATE_METADATA);
            expect(normalizedAction.existingMetadata).toEqual(normalizedMetadata);
            expect(normalizedAction.proposedMetadata).toEqual(normalizedMetadata);
        });

        it('correctly normalizes a update-plugin-metadata action', () => {
            const action = generateProposalActionUpdatePluginMetadata();
            const normalizedMetadata = { name: 'test-name', description: 'test-description', links: [] };
            normalizeActionMetadataSpy.mockReturnValue(normalizedMetadata);
            const normalizedAction = proposalActionUtils.normalizeUpdateMetaDataAction(action);
            expect(normalizedAction.type).toEqual(GukProposalActionType.UPDATE_PLUGIN_METADATA);
            expect(normalizedAction.existingMetadata).toEqual(normalizedMetadata);
            expect(normalizedAction.proposedMetadata).toEqual(normalizedMetadata);
        });
    });

    describe('normalizeActionMetadata', () => {
        const normalizeActionMetadataLinksSpy = jest.spyOn(proposalActionUtils, 'normalizeActionMetadataLinks');

        afterEach(() => {
            normalizeActionMetadataLinksSpy.mockReset();
        });

        afterAll(() => {
            normalizeActionMetadataLinksSpy.mockRestore();
        });

        it('sets default values for metadata when missing on the action metadata object', () => {
            const metadata = {};
            const normalizedMetadata = proposalActionUtils.normalizeActionMetadata(metadata);
            normalizeActionMetadataLinksSpy.mockReturnValue([]);
            expect(normalizedMetadata.name).toEqual('');
            expect(normalizedMetadata.description).toEqual('');
            expect(normalizedMetadata.links).toEqual([]);
        });

        it('correctly normalizes DAO metadata object', () => {
            const metadata = {
                name: 'dao-name',
                description: 'dao-description',
                avatar: 'ipfs://valid-cid',
                links: [],
            };
            const normalizedLinks = [{ label: 'test', href: 'href' }];
            normalizeActionMetadataLinksSpy.mockReturnValue(normalizedLinks);

            const expectedAvatarUrl = 'https://aragon-1.mypinata.cloud/ipfs/valid-cid?img-width=80&img-height=80';
            ipfsCidToSrcSpy.mockReturnValue(expectedAvatarUrl);
            const normalizedMetadata = proposalActionUtils.normalizeActionMetadata(metadata);
            expect(normalizeActionMetadataLinksSpy).toHaveBeenCalledWith(metadata.links);
            expect(normalizedMetadata.name).toEqual(metadata.name);
            expect(normalizedMetadata.description).toEqual(metadata.description);
            expect(normalizedMetadata.avatar).toEqual(expectedAvatarUrl);
            expect(normalizedMetadata.links).toEqual(normalizedLinks);
        });

        it('correctly normalizes plugin metadata object', () => {
            const metadata = { name: 'plugin-name', processKey: 'TEST', links: [] };
            const normalizedLinks = [{ label: 'test', href: 'href' }];
            normalizeActionMetadataLinksSpy.mockReturnValue(normalizedLinks);
            const normalizedMetadata = proposalActionUtils.normalizeActionMetadata(metadata);
            expect(normalizeActionMetadataLinksSpy).toHaveBeenCalledWith(metadata.links);
            expect(normalizedMetadata.name).toEqual(metadata.name);
            expect(normalizedMetadata.processKey).toEqual(metadata.processKey);
            expect(normalizedMetadata.links).toEqual(normalizedLinks);
        });
    });

    describe('normalizeActionMetadataLinks', () => {
        it('returns empty array when input is not defined', () => {
            expect(proposalActionUtils.normalizeActionMetadataLinks()).toEqual([]);
        });

        it('correctly normalizes the metadata links', () => {
            const links = [
                { name: 'name-1', url: 'url-1' },
                { name: 'name-2', url: 'url-2' },
            ];
            expect(proposalActionUtils.normalizeActionMetadataLinks(links)).toEqual([
                { label: links[0].name, href: links[0].url },
                { label: links[1].name, href: links[1].url },
            ]);
        });
    });

    describe('isWithdrawTokenAction', () => {
        it('returns true when action is of transfer type', () => {
            const action = generateProposalAction({ type: ProposalActionType.TRANSFER });
            expect(proposalActionUtils.isWithdrawTokenAction(action)).toBeTruthy();
        });

        it('returns false when action is not of transfer type', () => {
            const action = generateProposalAction({ type: ProposalActionType.METADATA_UPDATE });
            expect(proposalActionUtils.isWithdrawTokenAction(action)).toBeFalsy();
        });
    });

    describe('isUpdateMetadataAction', () => {
        it('returns true when action is of update-dao-metadata type', () => {
            const action = generateProposalAction({ type: ProposalActionType.METADATA_UPDATE });
            expect(proposalActionUtils.isUpdateMetadataAction(action)).toBeTruthy();
        });

        it('returns true when action is of update-plugin-metadata type', () => {
            const action = generateProposalAction({ type: ProposalActionType.METADATA_PLUGIN_UPDATE });
            expect(proposalActionUtils.isUpdateMetadataAction(action)).toBeTruthy();
        });

        it('returns false when action is not of update-metadata type', () => {
            const action = generateProposalAction({ type: ProposalActionType.TRANSFER });
            expect(proposalActionUtils.isUpdateMetadataAction(action)).toBeFalsy();
        });
    });

    describe('normalizeActionMetadataAvatar', () => {
        it('returns the correct avatar URL when metadata has a valid IPFS avatar', () => {
            const metadata = {
                name: 'dao-name',
                avatar: 'ipfs://valid-cid',
            };

            const expectedAvatarUrl = 'https://aragon-1.mypinata.cloud/ipfs/valid-cid?img-width=80&img-height=80';
            ipfsCidToSrcSpy.mockReturnValue(expectedAvatarUrl);

            const result = proposalActionUtils.normalizeActionMetadataAvatar(metadata);
            expect(result).toEqual(expectedAvatarUrl);
        });

        it('returns undefined when metadata does not have an avatar', () => {
            const metadata = { name: 'test-name' };
            const result = proposalActionUtils.normalizeActionMetadataAvatar(metadata);
            expect(result).toBeUndefined();
        });
    });
});
