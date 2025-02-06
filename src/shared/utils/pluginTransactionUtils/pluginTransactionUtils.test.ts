import { ProposalCreationMode, type ICreateProcessFormData } from '@/modules/createDao/components/createProcessForm';
import {
    prepareProcessDialogUtils,
    type IPluginSetupData,
} from '@/modules/createDao/dialogs/prepareProcessDialog/prepareProcessDialogUtils';
import { sppTransactionUtils } from '@/plugins/sppPlugin/utils/sppTransactionUtils';
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

        it('calls encodeFunctionData with the correct parameters', () => {
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
        const daoAddress = '0xDao';

        const testValues: ICreateProcessFormData = {
            name: 'TestProcess',
            processKey: 'KEY',
            description: 'TestDescription',
            resources: [],
            stages: [],
            permissions: {
                proposalCreationMode: ProposalCreationMode.ANY_WALLET,
                proposalCreationBodies: [],
            },
        };

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

            // - Grant multi-target permission on dao.
            const expectedGrantMultiTargetAction = { to: daoAddress, data: '0xGrantTxData', value: '0' };
            // - Apply installation actions.
            // - Update stages action.
            // - Update rules action.
            // For each plugin in setupData (apart from spp):
            //    - Revoke create proposal on sub-plugin.
            //    - Grant SPP create proposal on sub-plugin.
            //    - Revoke execute permission on sub-plugin.
            const expectedRevokePluginCreateProposalAction = { to: daoAddress, data: '0xRevokeTxData', value: '0' };
            const expectedGrantSppCreateProposalAction = { to: daoAddress, data: '0xGrantTxData', value: '0' };
            const expectedRevokeExecutePermission = { to: daoAddress, data: '0xRevokeTxData', value: '0' };
            // Revoke multi-target permission on dao.
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
