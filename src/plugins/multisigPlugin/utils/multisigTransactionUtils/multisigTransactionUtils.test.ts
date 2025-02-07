import { multisigPluginSetupAbi } from '@/modules/createDao/dialogs/prepareProcessDialog/abi/multisigPluginSetupAbi';
import { generateProcessFormBody } from '@/modules/createDao/testUtils/generators/processBodyForm';
import { generateProcessFormStage } from '@/modules/createDao/testUtils/generators/processFormStage';
import { generateCreateProposalEndDateFormData, generateCreateProposalFormData } from '@/modules/governance/testUtils';
import type { IBuildCreateProposalDataParams } from '@/modules/governance/types';
import { createProposalUtils } from '@/modules/governance/utils/createProposalUtils';
import { pluginTransactionUtils } from '@/shared/utils/pluginTransactionUtils';
import * as Viem from 'viem';
import { multisigPluginAbi } from './multisigPluginAbi';
import { type ICreateMultisigProposalFormData, multisigTransactionUtils } from './multisigTransactionUtils';

jest.mock('viem', () => ({ __esModule: true, ...jest.requireActual<typeof Viem>('viem') }));

describe('multisigTransaction utils', () => {
    const encodeFunctionDataSpy = jest.spyOn(Viem, 'encodeFunctionData');
    const parseStartDateSpy = jest.spyOn(createProposalUtils, 'parseStartDate');
    const parseEndDateSpy = jest.spyOn(createProposalUtils, 'parseEndDate');

    afterEach(() => {
        encodeFunctionDataSpy.mockReset();
        parseStartDateSpy.mockReset();
        parseEndDateSpy.mockReset();
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
        const encodeAbiParametersSpy = jest.spyOn(Viem, 'encodeAbiParameters');
        const buildPrepareInstallationDataSpy = jest.spyOn(pluginTransactionUtils, 'buildPrepareInstallationData');

        afterEach(() => {
            encodeAbiParametersSpy.mockReset();
            buildPrepareInstallationDataSpy.mockReset();
        });

        it('builds prepare installation data correctly', () => {
            const metadataCid = '0xSomeMetadataCID';
            const daoAddress: Viem.Hex = '0xDAOAddress';
            const permissionSettings = { someSetting: true, bodyId: '1' };
            const body = generateProcessFormBody();
            const stage = generateProcessFormStage();
            const params = { metadataCid, daoAddress, permissionSettings, stage, body };
            const pluginSettingsData = '0xPluginSettingsData';
            const transactionData = '0xTransactionData';

            encodeAbiParametersSpy.mockReturnValue(pluginSettingsData);
            buildPrepareInstallationDataSpy.mockReturnValue(transactionData);

            const result = multisigTransactionUtils.buildPrepareInstallData(params);

            const memberAddresses = body.members.map((member) => member.address);
            const expectedMultisigTarget = { target: pluginTransactionUtils.globalExecutor, operation: 1 };
            const expectedPluginSettings = { onlyListed: true, minApprovals: body.multisigThreshold };

            expect(encodeAbiParametersSpy).toHaveBeenCalledWith(multisigPluginSetupAbi, [
                memberAddresses,
                expectedPluginSettings,
                expectedMultisigTarget,
                metadataCid,
            ]);
            expect(buildPrepareInstallationDataSpy).toHaveBeenCalledWith(
                multisigTransactionUtils.multisigRepo,
                pluginSettingsData,
                daoAddress,
            );
            expect(result).toBe(transactionData);
        });
    });
});
