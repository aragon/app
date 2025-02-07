import {
    prepareProcessDialogUtils,
    type IPluginSetupData,
} from '@/modules/createDao/dialogs/prepareProcessDialog/prepareProcessDialogUtils';
import { sppTransactionUtils } from '@/plugins/sppPlugin/utils/sppTransactionUtils';
import { generateCreateProcessFormData } from '@/shared/testUtils/generators/createProcessFormData';
import { generatePluginSetupData } from '@/shared/testUtils/generators/pluginSetupData';
import { generatePluginSetupDataPermission } from '@/shared/testUtils/generators/pluginSetupDataPermission';
import { encodeAbiParameters, encodeFunctionData, keccak256, type Hex } from 'viem';
import { pluginSetupProcessorAbi } from './abi/pluginSetupProcessorAbi';
import { pluginTransactionUtils } from './pluginTransactionUtils';

jest.mock('viem', () => ({
    encodeAbiParameters: jest.fn(),
    keccak256: jest.fn(),
    encodeFunctionData: jest.fn(),
    toBytes: jest.fn(),
}));

describe('PluginTransactionUtils', () => {
    const buildApplyInstallSpy = jest.spyOn(pluginTransactionUtils, 'buildApplyInstallationTransactions');
    const buildUpdateStagesSpy = jest.spyOn(sppTransactionUtils, 'buildUpdateStagesTransaction');
    const buildUpdateRulesSpy = jest.spyOn(sppTransactionUtils, 'buildUpdateRulesTransaction');

    const daoAddress = '0x123';

    describe('hashHelpers', () => {
        it('calls encodeAbiParameters and keccak256 with the correct parameters', () => {
            const helpers: readonly Hex[] = [
                '0x0000000000000000000000000000000000000001',
                '0x0000000000000000000000000000000000000002',
            ];

            const encodedValue = '0xEncoded';
            const expectedHash = '0xHash';

            (encodeAbiParameters as jest.Mock).mockReturnValueOnce(encodedValue);
            (keccak256 as jest.Mock).mockReturnValueOnce(expectedHash);

            const result = pluginTransactionUtils.hashHelpers(helpers);

            expect(encodeAbiParameters).toHaveBeenCalledWith([{ type: 'address[]' }], [helpers]);
            expect(keccak256).toHaveBeenCalledWith(encodedValue);
            expect(result).toBe(expectedHash);
        });
    });

    describe('buildApplyInstallationTransactions', () => {
        it('correctly builds and returns installation transaction', () => {
            const setupData = [
                generatePluginSetupData({
                    pluginSetupRepo: '0xPluginSetupRepo' as Hex,
                    pluginAddress: '0x123' as Hex,
                    preparedSetupData: {
                        permissions: [generatePluginSetupDataPermission(), generatePluginSetupDataPermission()],
                        helpers: ['0xHelper1', '0xHelper1'] as readonly Hex[],
                    },
                }),
            ];

            (keccak256 as jest.Mock).mockReturnValueOnce('0xHash');

            const encodedTxData = '0xEncodedTxData';
            (encodeFunctionData as jest.Mock).mockReturnValueOnce(encodedTxData);

            const result = pluginTransactionUtils.buildApplyInstallationTransactions(setupData, daoAddress);

            expect(encodeFunctionData).toHaveBeenCalledWith(
                expect.objectContaining({
                    abi: pluginSetupProcessorAbi,
                    functionName: 'applyInstallation',
                    args: [
                        daoAddress,
                        expect.objectContaining({
                            pluginSetupRef: {
                                versionTag: setupData[0].versionTag,
                                pluginSetupRepo: setupData[0].pluginSetupRepo,
                            },
                            plugin: setupData[0].pluginAddress,
                            permissions: setupData[0].preparedSetupData.permissions,
                            helpersHash: '0xHash',
                        }),
                    ],
                }),
            );

            const expectedTransaction = {
                to: prepareProcessDialogUtils.pspRepoAddress,
                data: encodedTxData,
                value: '0',
            };

            expect(result).toEqual([expectedTransaction]);
        });
    });

    describe('buildInstallActions', () => {
        it('builds install actions correctly', () => {
            const testValues = generateCreateProcessFormData();

            const setupData: IPluginSetupData[] = [
                generatePluginSetupData({
                    pluginSetupRepo: '0xRepo1' as Hex,
                    pluginAddress: '0xPlugin1' as Hex,
                    preparedSetupData: {
                        permissions: [generatePluginSetupDataPermission()],
                        helpers: ['0xHelper1'] as readonly Hex[],
                    },
                }),
                generatePluginSetupData({
                    pluginSetupRepo: '0xRepo2' as Hex,
                    pluginAddress: '0xPlugin2' as Hex,
                    preparedSetupData: {
                        permissions: [generatePluginSetupDataPermission()],
                        helpers: ['0xHelper2'] as readonly Hex[],
                    },
                }),
            ];

            const applyInstallationActions = [{ to: '0xApplyTo' as Hex, data: '0xApplyData' as Hex, value: '0' }];

            buildApplyInstallSpy.mockReturnValue(applyInstallationActions);

            const updateStagesAction = { to: '0xStagesTo' as Hex, data: '0xStagesData' as Hex, value: '0' };

            const updateRulesAction = { to: '0xRulesTo' as Hex, data: '0xRulesData' as Hex, value: '0' };

            buildUpdateStagesSpy.mockReturnValue(updateStagesAction);

            buildUpdateRulesSpy.mockReturnValue(updateRulesAction);

            (encodeFunctionData as jest.Mock).mockImplementation(({ functionName }: { functionName: string }) => {
                return `0x${functionName}TxData`;
            });

            const actions = pluginTransactionUtils.buildInstallActions(testValues, setupData, daoAddress);

            const expectedGrantMultiTargetAction = { to: daoAddress, data: '0xgrantTxData', value: '0' };
            const expectedRevokePluginCreateProposalAction = { to: daoAddress, data: '0xrevokeTxData', value: '0' };
            const expectedGrantSppCreateProposalAction = { to: daoAddress, data: '0xgrantTxData', value: '0' };
            const expectedRevokeExecutePermission = { to: daoAddress, data: '0xrevokeTxData', value: '0' };
            const expectedRevokeMultiTargetAction = { to: daoAddress, data: '0xrevokeTxData', value: '0' };

            const expectedActions = [
                expectedGrantMultiTargetAction,
                ...applyInstallationActions,
                updateStagesAction,
                updateRulesAction,
                expectedRevokePluginCreateProposalAction,
                expectedGrantSppCreateProposalAction,
                expectedRevokeExecutePermission,
                expectedRevokeMultiTargetAction,
            ];

            expect(actions).toEqual(expectedActions);
            expect(buildApplyInstallSpy).toHaveBeenCalledWith(setupData, daoAddress);
            expect(buildUpdateStagesSpy).toHaveBeenCalledWith(
                testValues,
                setupData.map((data) => data.pluginAddress),
            );
            expect(buildUpdateRulesSpy).toHaveBeenCalledWith(testValues, setupData);
        });
    });
});
