import { ProposalCreationMode } from '@/modules/createDao/components/createProcessForm';
import { sppPluginSetupAbi } from '@/modules/createDao/dialogs/prepareProcessDialog/abi/sppPluginSetupAbi';
import { generateProcessFormStage } from '@/modules/createDao/testUtils/generators/processFormStage';
import { createProposalUtils } from '@/modules/governance/utils/createProposalUtils';
import { pluginTransactionUtils } from '@/shared/utils/pluginTransactionUtils';
import * as Viem from 'viem';
import { sppPluginAbi } from './sppPluginAbi';
import { sppTransactionUtils } from './sppTransactionUtils';

jest.mock('viem', () => ({
    __esModule: true,
    ...jest.requireActual<typeof Viem>('viem'),
}));

describe('sppTransaction utils', () => {
    const encodeFunctionDataSpy = jest.spyOn(Viem, 'encodeFunctionData');
    const encodeAbiParametersSpy = jest.spyOn(Viem, 'encodeAbiParameters');
    const parseStartDateSpy = jest.spyOn(createProposalUtils, 'parseStartDate');
    const buildPrepareInstallationDataSpy = jest.spyOn(pluginTransactionUtils, 'buildPrepareInstallationData');

    afterEach(() => {
        encodeFunctionDataSpy.mockReset();
        encodeAbiParametersSpy.mockReset();
        parseStartDateSpy.mockReset();
        buildPrepareInstallationDataSpy.mockReset();
    });

    describe('prepareSppMetadata', () => {
        it('returns metadata with stageNames extracted from stages', () => {
            const formData = {
                name: 'Test Process',
                description: 'Test description',
                resources: [{ name: 'Link', url: 'http://example.com' }],
                processKey: 'test-key',
                stages: [generateProcessFormStage({ name: 'Stage1' }), generateProcessFormStage({ name: 'Stage2' })],
                permissions: {
                    proposalCreationMode: ProposalCreationMode.ANY_WALLET,
                    proposalCreationBodies: [{ bodyId: 'body1', minVotingPower: '0' }],
                },
            };

            const expected = {
                name: 'Test Process',
                description: 'Test description',
                links: formData.resources,
                processKey: 'test-key',
                stageNames: ['Stage1', 'Stage2'],
            };

            const result = sppTransactionUtils.prepareSppMetadata(formData);
            expect(result).toEqual(expected);
        });
    });

    describe('buildCreateProposalData', () => {
        it('encodes createProposal data with correct parameters', () => {
            const startDate = 12345;
            parseStartDateSpy.mockReturnValue(startDate);

            const params = {
                metadata: '0xmetadata' as const,
                actions: [{ to: '0xAddress', data: '0xdata', value: '0' }],
                values: {
                    title: 'Proposal Title',
                    summary: 'Proposal Summary',
                    description: 'Proposal Description',
                    addActions: false,
                    resources: [],
                    actions: [],
                    startTimeMode: 'fixed' as const,
                    endTimeMode: 'duration' as const,
                },
                title: 'Proposal Title',
                description: 'Proposal Description',
                addActions: false,
                permissions: {
                    proposalCreationMode: ProposalCreationMode.ANY_WALLET,
                    proposalCreationBodies: [{ bodyId: 'body1', minVotingPower: '0' }],
                },
            };
            encodeFunctionDataSpy.mockReturnValue('0xEncodedData');

            const result = sppTransactionUtils.buildCreateProposalData(params);
            expect(Viem.encodeFunctionData).toHaveBeenCalledWith({
                abi: sppPluginAbi,
                functionName: 'createProposal',
                args: [params.metadata, params.actions, BigInt(0), startDate, [[]]],
            });
            expect(result).toBe('0xEncodedData');
        });
    });

    describe('buildPrepareSppInstallData', () => {
        it('builds prepare installation data correctly', () => {
            const metadataCid = '0xmetadataCID';
            const daoAddress: Viem.Hex = '0xDAOAddress';
            const sppTarget = { target: daoAddress, operation: 0 };

            encodeAbiParametersSpy.mockReturnValue('0xPluginSettingsData');
            buildPrepareInstallationDataSpy.mockReturnValue('0xTransactionData');

            const result = sppTransactionUtils.buildPrepareSppInstallData(metadataCid, daoAddress);
            expect(Viem.encodeAbiParameters).toHaveBeenCalledWith(sppPluginSetupAbi, [
                metadataCid as Viem.Hex,
                [],
                [],
                sppTarget,
            ]);
            expect(pluginTransactionUtils.buildPrepareInstallationData).toHaveBeenCalledWith(
                sppTransactionUtils.sppRepo,
                '0xPluginSettingsData',
                daoAddress,
            );
            expect(result).toBe('0xTransactionData');
        });
    });
});
