import { Network } from '@/shared/api/daoService';
import { networkDefinitions } from '@/shared/constants/networkDefinitions';
import { generateDao, generatePluginSetupData, generatePluginSetupDataPermission } from '@/shared/testUtils';
import type { Hex } from 'viem';
import * as Viem from 'viem';
import { pluginSetupProcessorAbi } from './abi/pluginSetupProcessorAbi';
import { pluginTransactionUtils } from './pluginTransactionUtils';

describe('pluginTransaction utils', () => {
    const parseEventLogsSpy = jest.spyOn(Viem, 'parseEventLogs');
    const keccak256Spy = jest.spyOn(Viem, 'keccak256');
    const encodeAbiParametersSpy = jest.spyOn(Viem, 'encodeAbiParameters');
    const encodeFunctionDataSpy = jest.spyOn(Viem, 'encodeFunctionData');

    afterEach(() => {
        parseEventLogsSpy.mockReset();
        keccak256Spy.mockReset();
        encodeAbiParametersSpy.mockReset();
        encodeFunctionDataSpy.mockReset();
    });

    describe('setupDataToActions', () => {
        const buildApplyInstallationTransactionSpy = jest.spyOn(
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            pluginTransactionUtils as any,
            'buildApplyInstallationData',
        );
        const installDataToActionSpy = jest.spyOn(pluginTransactionUtils, 'installDataToAction');

        afterEach(() => {
            buildApplyInstallationTransactionSpy.mockReset();
            installDataToActionSpy.mockReset();
        });

        afterAll(() => {
            buildApplyInstallationTransactionSpy.mockRestore();
            installDataToActionSpy.mockRestore();
        });

        it('builds the transactions for the given setup-data array and DAO', () => {
            const setupData = [generatePluginSetupData(), generatePluginSetupData()];
            const dao = generateDao({ network: Network.BASE_MAINNET, address: '0x1234' });

            const transactionData = '0x123' as Hex;
            const transactionOne = { to: '0x' as Hex, data: transactionData, value: '0' };
            const transactionTwo = { to: '0x' as Hex, data: transactionData, value: '0' };

            buildApplyInstallationTransactionSpy.mockReturnValue(transactionData);
            installDataToActionSpy.mockReturnValueOnce(transactionOne).mockReturnValueOnce(transactionTwo);

            const result = pluginTransactionUtils.setupDataToActions(setupData, dao);
            expect(buildApplyInstallationTransactionSpy).toHaveBeenNthCalledWith(1, setupData[0], dao.address);
            expect(buildApplyInstallationTransactionSpy).toHaveBeenNthCalledWith(2, setupData[1], dao.address);
            expect(installDataToActionSpy).toHaveBeenNthCalledWith(1, transactionData, dao.network);
            expect(installDataToActionSpy).toHaveBeenNthCalledWith(2, transactionData, dao.network);

            expect(result).toEqual([transactionOne, transactionTwo]);
        });
    });

    describe('buildPrepareInstallationData', () => {
        it('encodes function data with correct arguments', () => {
            const transactionData = '0xencoded-data';
            encodeFunctionDataSpy.mockReturnValue(transactionData);
            const pluginAddress = '0xAddress';
            const pluginVersion = { release: 1, build: 2 };
            const data = '0xSomeData';
            const daoAddress = '0xDAOAddress';

            const result = pluginTransactionUtils.buildPrepareInstallationData(
                pluginAddress,
                pluginVersion,
                data,
                daoAddress,
            );

            const expectedPluginSetupRef = { pluginSetupRepo: pluginAddress, versionTag: pluginVersion };
            expect(encodeFunctionDataSpy).toHaveBeenCalledWith({
                abi: pluginSetupProcessorAbi,
                functionName: 'prepareInstallation',
                args: [daoAddress, { pluginSetupRef: expectedPluginSetupRef, data }],
            });
            expect(result).toEqual(transactionData);
        });
    });

    describe('getPluginSetupData', () => {
        it('parses the transaction logs to return an array of plugin setup-data', () => {
            const transaction = { logs: [{ address: '0x123' }] } as unknown as Viem.TransactionReceipt;
            const parsedLog = {
                args: {
                    plugin: '0x123',
                    pluginSetupRepo: '0x456',
                    versionTag: { build: 1, release: 1 },
                    preparedSetupData: {},
                },
            };

            parseEventLogsSpy.mockReturnValue([parsedLog as unknown as Viem.Log<bigint, number, false>]);

            const result = pluginTransactionUtils.getPluginSetupData(transaction);
            expect(parseEventLogsSpy).toHaveBeenCalledWith({
                abi: pluginSetupProcessorAbi,
                eventName: 'InstallationPrepared',
                logs: transaction.logs,
            });

            const { plugin, ...expectedResult } = parsedLog.args;
            expect(result).toEqual([{ pluginAddress: parsedLog.args.plugin, ...expectedResult }]);
        });
    });

    describe('installDataToAction', () => {
        it('returns a transaction targeting the psp with the given transaction data', () => {
            const data = '0x0001';
            const network = Network.ETHEREUM_SEPOLIA;
            const result = pluginTransactionUtils.installDataToAction(data, network);
            expect(result.data).toEqual(data);
            expect(result.to).toEqual(networkDefinitions[network].addresses.pluginSetupProcessor);
            expect(result.value).toEqual('0');
        });
    });

    describe('buildApplyInstallationTransaction', () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const hashHelpersSpy = jest.spyOn(pluginTransactionUtils as any, 'hashHelpers');

        afterEach(() => {
            hashHelpersSpy.mockReset();
        });

        afterAll(() => {
            hashHelpersSpy.mockRestore();
        });

        it('correctly builds and returns the transaction to apply the plugin installation', () => {
            const daoAddress = '0x123';
            const helpersHash = '0x0000001';
            const setupPermissions = [generatePluginSetupDataPermission()];
            const setupData = generatePluginSetupData({
                pluginSetupRepo: '0x123',
                pluginAddress: '0x456',
                preparedSetupData: { permissions: setupPermissions, helpers: ['0x000', '0x111'] },
            });
            const { preparedSetupData, versionTag, pluginSetupRepo, pluginAddress } = setupData;

            hashHelpersSpy.mockReturnValue(helpersHash);
            const encodedTxData = '0xEncodedTxData';
            encodeFunctionDataSpy.mockReturnValueOnce(encodedTxData);

            const result = pluginTransactionUtils['buildApplyInstallationData'](setupData, daoAddress);
            expect(hashHelpersSpy).toHaveBeenCalledWith(preparedSetupData.helpers);

            expect(encodeFunctionDataSpy).toHaveBeenCalledWith({
                abi: pluginSetupProcessorAbi,
                functionName: 'applyInstallation',
                args: [
                    daoAddress,
                    {
                        pluginSetupRef: { versionTag, pluginSetupRepo },
                        plugin: pluginAddress,
                        permissions: preparedSetupData.permissions,
                        helpersHash,
                    },
                ],
            });

            expect(result).toEqual(encodedTxData);
        });
    });

    describe('hashHelpers', () => {
        it('calls encodeAbiParameters and keccak256 with the correct parameters', () => {
            const helpers: readonly Hex[] = ['0xHelper1', '0xHelper2'];

            const encodedValue = '0xEncoded';
            const expectedHash = '0xHash';

            encodeAbiParametersSpy.mockReturnValueOnce(encodedValue);
            keccak256Spy.mockReturnValueOnce(expectedHash);

            const result = pluginTransactionUtils['hashHelpers'](helpers);

            expect(encodeAbiParametersSpy).toHaveBeenCalledWith([{ type: 'address[]' }], [helpers]);
            expect(keccak256Spy).toHaveBeenCalledWith(encodedValue);
            expect(result).toBe(expectedHash);
        });
    });
});
