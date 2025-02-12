import { generateCreateProcessFormBody, generateCreateProcessFormStage } from '@/modules/createDao/testUtils';
import { generateCreateProposalEndDateFormData, generateCreateProposalFormData } from '@/modules/governance/testUtils';
import type { IBuildCreateProposalDataParams } from '@/modules/governance/types';
import { createProposalUtils } from '@/modules/governance/utils/createProposalUtils';
import { multisigPlugin } from '@/plugins/multisigPlugin/constants/multisigPlugin';
import { Network } from '@/shared/api/daoService';
import { networkDefinitions } from '@/shared/constants/networkDefinitions';
import { generateDao } from '@/shared/testUtils';
import { pluginTransactionUtils } from '@/shared/utils/pluginTransactionUtils';
import * as Viem from 'viem';
import { multisigPluginAbi, multisigPluginSetupAbi } from './multisigPluginAbi';
import { type ICreateMultisigProposalFormData, multisigTransactionUtils } from './multisigTransactionUtils';

jest.mock('viem', () => ({ __esModule: true, ...jest.requireActual<typeof Viem>('viem') }));

describe('multisigTransaction utils', () => {
    const encodeFunctionDataSpy = jest.spyOn(Viem, 'encodeFunctionData');
    const encodeAbiParametersSpy = jest.spyOn(Viem, 'encodeAbiParameters');
    const parseStartDateSpy = jest.spyOn(createProposalUtils, 'parseStartDate');
    const parseEndDateSpy = jest.spyOn(createProposalUtils, 'parseEndDate');
    const buildPrepareInstallationDataSpy = jest.spyOn(pluginTransactionUtils, 'buildPrepareInstallationData');

    afterEach(() => {
        encodeFunctionDataSpy.mockReset();
        encodeAbiParametersSpy.mockReset();
        parseStartDateSpy.mockReset();
        parseEndDateSpy.mockReset();
        buildPrepareInstallationDataSpy.mockReset();
    });

    describe('buildCreateProposalData', () => {
        it('correctly encodes the create-proposal data from the given parameters', () => {
            const startDate = 0;
            const endDate = 1728660603;
            const values = { ...generateCreateProposalFormData(), ...generateCreateProposalEndDateFormData() };
            const params: IBuildCreateProposalDataParams<ICreateMultisigProposalFormData> = {
                metadata: '0xdao-metadata-cid',
                actions: [
                    {
                        to: '0x00C51Fad10462780e488B54D413aD92B28b88204',
                        data: '0x0000000000000000000000084512000',
                        value: '0',
                    },
                ],
                values,
            };
            parseStartDateSpy.mockReturnValue(startDate);
            parseEndDateSpy.mockReturnValue(endDate);
            multisigTransactionUtils.buildCreateProposalData(params);
            expect(encodeFunctionDataSpy).toHaveBeenCalledWith({
                abi: multisigPluginAbi,
                functionName: 'createProposal',
                args: [params.metadata, params.actions, BigInt(0), false, false, startDate, endDate],
            });
        });
    });

    describe('buildVoteData', () => {
        it('correctly encodes vote data with the given proposal index', () => {
            const proposalIndex = '3';
            multisigTransactionUtils.buildVoteData({ proposalIndex });
            expect(encodeFunctionDataSpy).toHaveBeenCalledWith({
                abi: multisigPluginAbi,
                functionName: 'approve',
                args: [proposalIndex, false],
            });
        });
    });

    describe('buildPrepareInstallData', () => {
        const metadataCid = '0xSomeMetadataCID';
        const dao = generateDao({ network: Network.BASE_MAINNET });
        const permissionSettings = { someSetting: true, bodyId: '1' };
        const body = generateCreateProcessFormBody();
        const stage = generateCreateProcessFormStage();
        const params = { metadataCid, dao, permissionSettings, stage, body };

        it('encodes the plugin settings correctly using encodeAbiParameters', () => {
            const pluginSettingsData = '0xPluginSettingsData';
            encodeAbiParametersSpy.mockReturnValue(pluginSettingsData);

            multisigTransactionUtils.buildPrepareInstallData(params);

            const memberAddresses = body.members.map((member) => member.address);
            const expectedMultisigTarget = {
                target: networkDefinitions[dao.network].addresses.globalExecutor,
                operation: 1,
            };
            const expectedPluginSettings = { onlyListed: true, minApprovals: body.multisigThreshold };

            expect(encodeAbiParametersSpy).toHaveBeenCalledWith(multisigPluginSetupAbi, [
                memberAddresses,
                expectedPluginSettings,
                expectedMultisigTarget,
                metadataCid,
            ]);
        });

        it('builds prepare installation data correctly using buildPrepareInstallationData', () => {
            const pluginSettingsData = '0xPluginSettingsData';
            const transactionData = '0xTransactionData';

            encodeAbiParametersSpy.mockReturnValue(pluginSettingsData);
            buildPrepareInstallationDataSpy.mockReturnValue(transactionData);

            const result = multisigTransactionUtils.buildPrepareInstallData(params);

            expect(buildPrepareInstallationDataSpy).toHaveBeenCalledWith(
                multisigPlugin.repositoryAddresses[dao.network],
                multisigPlugin.installVersion,
                pluginSettingsData,
                dao.address,
            );

            expect(result).toBe(transactionData);
        });
    });
});
