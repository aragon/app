import { type ICreateProcessFormData } from '@/modules/createDao/components/createProcessForm';
import {
    prepareProcessDialogUtils,
    type IPluginSetupData,
} from '@/modules/createDao/dialogs/prepareProcessDialog/prepareProcessDialogUtils';
import { pluginSetupProcessorAbi } from '@/modules/createDao/dialogs/publishProcessDialog/abi/pluginSetupProcessorAbi';
import { sppTransactionUtils } from '@/plugins/sppPlugin/utils/sppTransactionUtils';
import { generatePluginSetupData } from '@/shared/testUtils/generators/pluginSetupData';
import { generatePluginSetupDataPermission } from '@/shared/testUtils/generators/pluginSetupDataPermission';
import { encodeAbiParameters, encodeFunctionData, keccak256, type Hex } from 'viem';
import { pluginTransactionUtils } from './pluginTransactionUtils';

jest.mock('viem', () => ({
    encodeAbiParameters: jest.fn(),
    keccak256: jest.fn(),
    encodeFunctionData: jest.fn(),
    toBytes: jest.fn(),
}));

describe('PluginTransactionUtils', () => {
    describe('hashHelpers', () => {
        const helpers: readonly Hex[] = [
            '0x0000000000000000000000000000000000000001',
            '0x0000000000000000000000000000000000000002',
        ];

        it('calls encodeAbiParameters and keccak256 with the correct parameters', () => {
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
        const daoAddress = '0x123';

        it('handles a single plugin setup', () => {
            const singleSetupData = [
                generatePluginSetupData({
                    pluginSetupRepo: '0xSingleRepo' as Hex,
                    pluginAddress: '0xSinglePlugin' as Hex,
                    preparedSetupData: {
                        permissions: [generatePluginSetupDataPermission()],
                        helpers: ['0xHelperSingle'] as readonly Hex[],
                    },
                }),
            ];

            (encodeAbiParameters as jest.Mock).mockReturnValueOnce('0xEncodedSingle');
            (keccak256 as jest.Mock).mockReturnValueOnce('0xSingleHash');

            const encodedTxData = '0xEncodedTxDataSingle';
            (encodeFunctionData as jest.Mock).mockReturnValueOnce(encodedTxData);

            const result = pluginTransactionUtils.buildApplyInstallationTransactions(singleSetupData, daoAddress);

            expect(encodeFunctionData).toHaveBeenCalledWith(
                expect.objectContaining({
                    abi: pluginSetupProcessorAbi,
                    functionName: 'applyInstallation',
                    args: [
                        daoAddress,
                        expect.objectContaining({
                            pluginSetupRef: {
                                versionTag: { release: 1, build: 1 },
                                pluginSetupRepo: singleSetupData[0].pluginSetupRepo,
                            },
                            plugin: singleSetupData[0].pluginAddress,
                            permissions: singleSetupData[0].preparedSetupData.permissions,
                            helpersHash: '0xSingleHash',
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

        it('calls encodeFunctionData with the correct parameters', () => {
            const hashHelpersSpy = jest.spyOn(pluginTransactionUtils, 'hashHelpers');

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

            const hash = '0xTestHash';
            hashHelpersSpy.mockReturnValue(hash);

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
                            helpersHash: hash,
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
        const daoAddress = '0xDao';

        const testValues = {} as ICreateProcessFormData;
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

        it('builds install actions correctly', () => {
            const applyInstallationActions = [{ to: '0xApply' as Hex, data: '0xApply' as Hex, value: '0' }];

            const buildApplySpy = jest
                .spyOn(pluginTransactionUtils, 'buildApplyInstallationTransactions')
                .mockReturnValue(applyInstallationActions);

            const updateStagesAction = { to: '0xStages' as Hex, data: '0xStagesTx' as Hex, value: '0' };

            const updateRulesAction = { to: '0xRules' as Hex, data: '0xRulesTx' as Hex, value: '0' };

            const buildUpdateStagesSpy = jest
                .spyOn(sppTransactionUtils, 'buildUpdateStagesTransaction')
                .mockReturnValue(updateStagesAction);

            const buildUpdateRulesSpy = jest
                .spyOn(sppTransactionUtils, 'buildUpdateRulesTransaction')
                .mockReturnValue(updateRulesAction);

            (encodeFunctionData as jest.Mock).mockImplementation(({ functionName }: { functionName: string }) => {
                if (functionName === 'grant') {
                    return '0xGrantTxData';
                }
                if (functionName === 'revoke') {
                    return '0xRevokeTxData';
                }

                return '0xUnknown';
            });

            const actions = pluginTransactionUtils.buildInstallActions(testValues, setupData, daoAddress);

            // Expected actions:
            // 1. Grant multi-target permission on dao.
            const expectedGrantMultiTargetAction = { to: daoAddress, data: '0xGrantTxData', value: '0' };
            // 2. Apply installation actions.
            // 3. Update stages action.
            // 4. Update rules action.
            // 5. For each plugin in setupData (apart from spp):
            //    - Revoke create proposal on sub-plugin.
            //    - Grant SPP create proposal on sub-plugin.
            //    - Revoke execute permission on sub-plugin.
            const expectedRevokePluginCreateProposalAction = { to: daoAddress, data: '0xRevokeTxData', value: '0' };
            const expectedGrantSppCreateProposalAction = { to: daoAddress, data: '0xGrantTxData', value: '0' };
            const expectedRevokeExecutePermission = { to: daoAddress, data: '0xRevokeTxData', value: '0' };
            // 6. Revoke multi-target permission on dao.
            const expectedRevokeMultiTargetAction = { to: daoAddress, data: '0xRevokeTxData', value: '0' };

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

            expect(buildApplySpy).toHaveBeenCalledWith(setupData, daoAddress);
            expect(buildUpdateStagesSpy).toHaveBeenCalledWith(
                testValues,
                setupData.map((data) => data.pluginAddress),
            );
            expect(buildUpdateRulesSpy).toHaveBeenCalledWith(testValues, setupData);
        });
    });
});
