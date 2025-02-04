import {
    prepareProcessDialogUtils,
    type IPluginSetupDataPermission,
} from '@/modules/createDao/dialogs/prepareProcessDialog/prepareProcessDialogUtils';
import { encodeAbiParameters, encodeFunctionData, keccak256, type Hex } from 'viem';
import { pluginUtils } from './pluginUtils';

jest.mock('viem', () => ({
    encodeAbiParameters: jest.fn(),
    keccak256: jest.fn(),
    encodeFunctionData: jest.fn(),
}));

describe('PluginUtils', () => {
    describe('hashHelpers', () => {
        const helpers: readonly Hex[] = [
            '0x0000000000000000000000000000000000000001',
            '0x0000000000000000000000000000000000000002',
        ];

        it('calls encodeAbiParameters and keccak256 with the correct parameters', () => {
            const encodedValue = '0xencoded';
            const expectedHash = '0xhash';

            (encodeAbiParameters as jest.Mock).mockReturnValueOnce(encodedValue);
            (keccak256 as jest.Mock).mockReturnValueOnce(expectedHash);

            const result = pluginUtils.hashHelpers(helpers);

            expect(encodeAbiParameters).toHaveBeenCalledWith([{ type: 'address[]' }], [helpers]);
            expect(keccak256).toHaveBeenCalledWith(encodedValue);
            expect(result).toBe(expectedHash);
        });
    });

    describe('buildApplyInstallationTransactions (with hashHelpers spy)', () => {
        const setupData = [
            {
                pluginSetupRepo: '0xPluginSetupRepo' as Hex,
                versionTag: { release: 1, build: 1 },
                pluginAddress: '0x123' as Hex,
                preparedSetupData: {
                    permissions: [
                        {
                            operation: 0,
                            where: '0x1',
                            who: '0x1',
                            condition: '0x1',
                            permissionId: '0x1',
                        },
                        {
                            operation: 0,
                            where: '0x2',
                            who: '0x2',
                            condition: '0x2',
                            permissionId: '0x2',
                        },
                    ] as readonly IPluginSetupDataPermission[],
                    helpers: ['0xhelper1', '0xhelper1'] as readonly Hex[],
                },
            },
        ];
        const daoAddress = '0x123';

        it('calls encodeFunctionData with the correct parameters using a hashHelpers spy', () => {
            const hashHelpersSpy = jest.spyOn(pluginUtils, 'hashHelpers');

            const hash = '0xTestHash';
            hashHelpersSpy.mockReturnValue(hash);

            const encodedTxData = '0xencodedTxData';
            (encodeFunctionData as jest.Mock).mockReturnValueOnce(encodedTxData);

            const result = pluginUtils.buildApplyInstallationTransactions(setupData, daoAddress);

            expect(encodeFunctionData).toHaveBeenCalledWith(
                expect.objectContaining({
                    abi: expect.anything() as unknown,
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

            expect(result).toEqual([{ to: prepareProcessDialogUtils.pspRepoAddress, data: encodedTxData, value: '0' }]);
        });
    });
});
