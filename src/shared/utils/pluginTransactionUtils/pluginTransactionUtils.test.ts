import { Network } from '@/shared/api/daoService';
import { networkDefinitions } from '@/shared/constants/networkDefinitions';
import {
    generateDao,
    generatePluginInstallationSetupData,
    generatePluginSetupDataPermission,
} from '@/shared/testUtils';
import type { Hex } from 'viem';
import * as Viem from 'viem';
import { permissionTransactionUtils } from '../permissionTransactionUtils';
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

    describe('getPluginInstallationSetupData', () => {
        it('parses the transaction logs to return an array of plugin setup-data', () => {
            const transaction = { logs: [{ address: '0x123' }] } as unknown as Viem.TransactionReceipt;
            const versionTag = { build: 1, release: 1 };
            const parsedLog = {
                args: { plugin: '0x123', pluginSetupRepo: '0x456', versionTag, preparedSetupData: {} },
            };

            parseEventLogsSpy.mockReturnValue([parsedLog as unknown as Viem.Log<bigint, number, false>]);

            const result = pluginTransactionUtils.getPluginInstallationSetupData(transaction);
            expect(parseEventLogsSpy).toHaveBeenCalledWith({
                abi: pluginSetupProcessorAbi,
                eventName: 'InstallationPrepared',
                logs: transaction.logs,
            });

            const { plugin, ...expectedResult } = parsedLog.args;
            expect(result).toEqual([{ pluginAddress: parsedLog.args.plugin, ...expectedResult }]);
        });
    });

    describe('buildPrepareInstallationData', () => {
        it('encodes function data with correct arguments', () => {
            const transactionData = '0xencoded-data';
            const pluginSetupRepo = '0xAddress';
            const versionTag = { release: 1, build: 2 };
            const data = '0xSomeData';
            const daoAddress = '0xDAOAddress';

            encodeFunctionDataSpy.mockReturnValue(transactionData);
            const result = pluginTransactionUtils.buildPrepareInstallationData(
                pluginSetupRepo,
                versionTag,
                data,
                daoAddress,
            );

            expect(encodeFunctionDataSpy).toHaveBeenCalledWith({
                abi: pluginSetupProcessorAbi,
                functionName: 'prepareInstallation',
                args: [daoAddress, { pluginSetupRef: { pluginSetupRepo, versionTag }, data }],
            });
            expect(result).toEqual(transactionData);
        });
    });

    describe('getPluginTargetConfig', () => {
        it('returns call operation and dao target for simple governance setup', () => {
            const dao = generateDao({ address: '0x123' });
            const isAdvancedGovernace = false;
            const result = pluginTransactionUtils.getPluginTargetConfig(dao, isAdvancedGovernace);
            expect(result).toEqual({ target: dao.address, operation: 0 });
        });

        it('returns delegate-call operation and global-executor target for simple governance setup', () => {
            const dao = generateDao({ address: '0x456', network: Network.ETHEREUM_MAINNET });
            const isAdvancedGovernace = true;
            const { globalExecutor } = networkDefinitions[dao.network].addresses;
            const result = pluginTransactionUtils.getPluginTargetConfig(dao, isAdvancedGovernace);
            expect(result).toEqual({ target: globalExecutor, operation: 1 });
        });
    });

    describe('buildApplyPluginsInstallationActions', () => {
        const grantPermissionSpy = jest.spyOn(permissionTransactionUtils, 'buildGrantPermissionTransaction');
        const revokePermissionSpy = jest.spyOn(permissionTransactionUtils, 'buildRevokePermissionTransaction');

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const setupDataToActionsSpy = jest.spyOn(pluginTransactionUtils as any, 'setupInstallationDataToAction');

        afterEach(() => {
            grantPermissionSpy.mockReset();
            revokePermissionSpy.mockReset();
            setupDataToActionsSpy.mockReset();
        });

        afterAll(() => {
            setupDataToActionsSpy.mockRestore();
        });

        it('builds the required transaction to apply the plugin installation', () => {
            const daoAddress = '0x123' as Hex;
            const dao = generateDao({ address: daoAddress });
            const setupData = [generatePluginInstallationSetupData(), generatePluginInstallationSetupData()];
            const grantAction = { to: daoAddress, data: '0xgrant' as Viem.Hex, value: BigInt(0) };
            const setupActions = [
                { to: '0x001', data: '0xsetup1', value: BigInt(0) },
                { to: '0x002', data: '0xsetup2', value: BigInt(0) },
            ];
            const revokeAction = { to: daoAddress, data: '0xrevoke' as Viem.Hex, value: BigInt(0) };

            grantPermissionSpy.mockReturnValueOnce(grantAction);
            setupDataToActionsSpy.mockReturnValueOnce(setupActions[0]).mockReturnValueOnce(setupActions[1]);
            revokePermissionSpy.mockReturnValueOnce(revokeAction);

            const result = pluginTransactionUtils.buildApplyPluginsInstallationActions({ dao, setupData });
            expect(result).toEqual([grantAction, ...setupActions, revokeAction]);
        });
    });

    describe('setupInstallationDataToAction', () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const hashHelpersSpy = jest.spyOn(pluginTransactionUtils as any, 'hashHelpers');

        afterEach(() => {
            hashHelpersSpy.mockReset();
        });

        afterAll(() => {
            hashHelpersSpy.mockRestore();
        });

        it('correctly builds and returns the transaction to apply the plugin installation', () => {
            const dao = generateDao({ address: '0x123', network: Network.BASE_MAINNET });
            const helpersHash = '0x0000001';
            const setupPermissions = [generatePluginSetupDataPermission()];
            const encodedTxData = '0xEncodedTxData';
            const setupData = generatePluginInstallationSetupData({
                pluginSetupRepo: '0x123',
                pluginAddress: '0x456',
                preparedSetupData: { permissions: setupPermissions, helpers: ['0x000', '0x111'] },
            });
            const { preparedSetupData, versionTag, pluginSetupRepo, pluginAddress } = setupData;

            hashHelpersSpy.mockReturnValue(helpersHash);
            encodeFunctionDataSpy.mockReturnValueOnce(encodedTxData);

            const result = pluginTransactionUtils['setupInstallationDataToAction'](setupData, dao);
            expect(hashHelpersSpy).toHaveBeenCalledWith(preparedSetupData.helpers);

            expect(encodeFunctionDataSpy).toHaveBeenCalledWith({
                abi: pluginSetupProcessorAbi,
                functionName: 'applyInstallation',
                args: [
                    dao.address,
                    {
                        pluginSetupRef: { versionTag, pluginSetupRepo },
                        plugin: pluginAddress,
                        permissions: preparedSetupData.permissions,
                        helpersHash,
                    },
                ],
            });

            expect(result.to).toEqual(networkDefinitions[dao.network].addresses.pluginSetupProcessor);
            expect(result.data).toEqual(encodedTxData);
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
