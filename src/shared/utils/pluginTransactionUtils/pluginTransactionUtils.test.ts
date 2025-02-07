import { prepareProcessDialogUtils } from '@/modules/createDao/dialogs/prepareProcessDialog/prepareProcessDialogUtils';
import { generatePluginSetupData } from '@/shared/testUtils/generators/pluginSetupData';
import { generatePluginSetupDataPermission } from '@/shared/testUtils/generators/pluginSetupDataPermission';
import * as Viem from 'viem';
import { type Hex } from 'viem';
import { pluginSetupProcessorAbi } from './abi/pluginSetupProcessorAbi';
import { pluginTransactionUtils } from './pluginTransactionUtils';

jest.mock('viem', () => ({ __esModule: true, ...jest.requireActual<typeof Viem>('viem') }));

describe('PluginTransactionUtils', () => {
    const keccak256Spy = jest.spyOn(Viem, 'keccak256');
    const encodeAbiParametersSpy = jest.spyOn(Viem, 'encodeAbiParameters');
    const encodeFunctionDataSpy = jest.spyOn(Viem, 'encodeFunctionData');

    afterEach(() => {
        keccak256Spy.mockReset();
        encodeAbiParametersSpy.mockReset();
        encodeFunctionDataSpy.mockReset();
    });

    const daoAddress = '0x123';

    describe('buildApplyInstallationTransactions', () => {
        it('correctly builds and returns installation transaction', () => {
            const setupData = [
                generatePluginSetupData({
                    pluginSetupRepo: '0xPluginSetupRepo' as Hex,
                    pluginAddress: '0x123' as Hex,
                    preparedSetupData: {
                        permissions: [generatePluginSetupDataPermission(), generatePluginSetupDataPermission()],
                        helpers: [
                            '0x1111111111111111111111111111111111111111',
                            '0x1111111111111111111111111111111111111111',
                        ] as readonly Hex[],
                    },
                }),
            ];

            keccak256Spy.mockReturnValueOnce('0xHash');

            const encodedTxData = '0xEncodedTxData';
            encodeFunctionDataSpy.mockReturnValueOnce(encodedTxData);

            const result = pluginTransactionUtils.buildApplyInstallationTransactions(setupData, daoAddress);

            expect(encodeFunctionDataSpy).toHaveBeenCalledWith(
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

    describe('hashHelpers', () => {
        it('calls encodeAbiParameters and keccak256 with the correct parameters', () => {
            const helpers: readonly Hex[] = ['0xHelper1', '0xHelper2'];

            const encodedValue = '0xEncoded';
            const expectedHash = '0xHash';

            encodeAbiParametersSpy.mockReturnValueOnce(encodedValue);
            keccak256Spy.mockReturnValueOnce(expectedHash);

            const result = pluginTransactionUtils.hashHelpers(helpers);

            expect(encodeAbiParametersSpy).toHaveBeenCalledWith([{ type: 'address[]' }], [helpers]);
            expect(keccak256Spy).toHaveBeenCalledWith(encodedValue);
            expect(result).toBe(expectedHash);
        });
    });
});
