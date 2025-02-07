import { pluginSetupProcessorAbi } from '@/modules/createDao/dialogs/prepareProcessDialog/abi/pluginSetupProcessorAbi';
import * as Viem from 'viem';
import { pluginTransactionUtils } from './pluginTransactionUtils';

jest.mock('viem', () => ({ __esModule: true, ...jest.requireActual<typeof Viem>('viem') }));

describe('PluginTransactionUtils', () => {
    const encodeFunctionDataSpy = jest.spyOn(Viem, 'encodeFunctionData');
    const parseEventLogsSpy = jest.spyOn(Viem, 'parseEventLogs');

    afterEach(() => {
        encodeFunctionDataSpy.mockReset();
        parseEventLogsSpy.mockReset();
    });

    describe('buildPrepareInstallationData', () => {
        it('encodes function data with correct arguments', () => {
            encodeFunctionDataSpy.mockReturnValue('0xEncodedData');
            const pluginRepo = { address: '0xAddress' as const, version: { release: 1, build: 2 } };
            const data = '0xSomeData';
            const daoAddress = '0xDAOAddress';

            const result = pluginTransactionUtils.buildPrepareInstallationData(pluginRepo, data, daoAddress);

            expect(encodeFunctionDataSpy).toHaveBeenCalledWith({
                abi: pluginSetupProcessorAbi,
                functionName: 'prepareInstallation',
                args: [
                    daoAddress,
                    {
                        pluginSetupRef: {
                            pluginSetupRepo: pluginRepo.address,
                            versionTag: pluginRepo.version,
                        },
                        data,
                    },
                ],
            });
            expect(result).toBe('0xEncodedData');
        });
    });

    describe('getPluginSetupData', () => {
        it('parses event logs and maps them to plugin setup data', () => {
            const fakeLog = {
                address: '0xFakeAddress' as const,
                blockHash: '0xFakeBlockHash' as const,
                blockNumber: BigInt(123),
                data: '0xFakeData' as const,
                logIndex: 0,
                transactionHash: '0xFakeTransactionHash' as const,
                transactionIndex: 0,
                removed: false,
                topics: ['0xFakeTopic'] as [`0x${string}`, ...Array<`0x${string}`>],
                eventName: 'InstallationPrepared',
                args: {
                    plugin: '0xPlugin',
                    pluginSetupRepo: '0xRepo',
                    versionTag: { release: 1, build: 2 },
                    preparedSetupData: {
                        helpers: ['0xHelper'],
                        permissions: [
                            {
                                operation: 1,
                                where: '0xWhere',
                                who: '0xWho',
                                condition: '0xCondition',
                                permissionId: '0xPermission',
                            },
                        ],
                    },
                },
            };

            const fakeLogs = [fakeLog];
            parseEventLogsSpy.mockReturnValue(fakeLogs);

            const fakeReceipt: Viem.TransactionReceipt = {
                blockHash: '0xFakeBlockHash',
                blockNumber: BigInt(123),
                contractAddress: '0xFakeContractAddress',
                cumulativeGasUsed: BigInt(100000),
                effectiveGasPrice: BigInt(1000000000),
                from: '0xFakeFrom',
                gasUsed: BigInt(21000),
                logs: fakeLogs,
                logsBloom: '0xFakeBloom',
                status: 'success',
                to: '0xFakeTo',
                transactionHash: '0xFakeTransactionHash',
                transactionIndex: 0,
                type: 'eip1559',
            };

            const result = pluginTransactionUtils.getPluginSetupData(fakeReceipt);

            expect(parseEventLogsSpy).toHaveBeenCalledWith({
                abi: pluginSetupProcessorAbi,
                eventName: 'InstallationPrepared',
                logs: fakeLogs,
            });
            expect(result).toEqual([
                {
                    pluginAddress: fakeLog.args.plugin,
                    pluginSetupRepo: fakeLog.args.pluginSetupRepo,
                    versionTag: { release: 1, build: 2 },
                    preparedSetupData: {
                        helpers: [fakeLog.args.preparedSetupData.helpers[0]],
                        permissions: [
                            {
                                operation: fakeLog.args.preparedSetupData.permissions[0].operation,
                                where: fakeLog.args.preparedSetupData.permissions[0].where,
                                who: fakeLog.args.preparedSetupData.permissions[0].who,
                                condition: fakeLog.args.preparedSetupData.permissions[0].condition,
                                permissionId: fakeLog.args.preparedSetupData.permissions[0].permissionId,
                            },
                        ],
                    },
                },
            ]);
        });
    });
});
