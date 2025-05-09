import { Network } from '@/shared/api/daoService';
import { networkDefinitions } from '@/shared/constants/networkDefinitions';
import { generateDao, generateDaoPlugin } from '@/shared/testUtils';
import { pluginRegistryUtils } from '@/shared/utils/pluginRegistryUtils';
import { type IPluginUpdateSetupData, pluginTransactionUtils } from '@/shared/utils/pluginTransactionUtils';
import { transactionUtils } from '@/shared/utils/transactionUtils';
import * as Viem from 'viem';
import { daoAbi } from './daoAbi';
import { pluginSetupProcessorAbi } from './pluginSetupProcessorAbi';
import { prepareDaoContractsUpdateDialogUtils } from './prepareDaoContractsUpdateDialogUtils';

describe('prepareDaoContractsUpdateDialog utils', () => {
    const getPluginSpy = jest.spyOn(pluginRegistryUtils, 'getPlugin');
    const getSlotFunctionSpy = jest.spyOn(pluginRegistryUtils, 'getSlotFunction');
    const encodeFunctionDataSpy = jest.spyOn(Viem, 'encodeFunctionData');
    const getPluginUpdateSetupDataSpy = jest.spyOn(pluginTransactionUtils, 'getPluginUpdateSetupData');
    const buildApplyPluginsUpdateActionsSpy = jest.spyOn(pluginTransactionUtils, 'buildApplyPluginsUpdateActions');

    afterEach(() => {
        getPluginSpy.mockReset();
        getSlotFunctionSpy.mockReset();
        encodeFunctionDataSpy.mockReset();
        getPluginUpdateSetupDataSpy.mockReset();
        buildApplyPluginsUpdateActionsSpy.mockReset();
    });

    describe('buildPrepareUpdatePluginsTransaction', () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const buildTxSpy = jest.spyOn(prepareDaoContractsUpdateDialogUtils as any, 'buildPrepareUpdateTransaction');
        const encodeTxSpy = jest.spyOn(transactionUtils, 'encodeTransactionRequests');

        afterEach(() => {
            buildTxSpy.mockReset();
            encodeTxSpy.mockReset();
        });

        afterAll(() => {
            buildTxSpy.mockRestore();
        });

        it('builds the transactions to update all specified plugins and encodes them to one transaction', async () => {
            const dao = generateDao({ network: Network.BASE_MAINNET });
            const plugins = [generateDaoPlugin(), generateDaoPlugin()];
            const updateTransactions = ['0x01', '0x02'];
            const encodedTransaction = { to: '0x1', data: '0xencoded', value: BigInt(0) } as const;
            const { pluginSetupProcessor: expectedTo } = networkDefinitions[dao.network].addresses;
            buildTxSpy.mockReturnValueOnce(updateTransactions[0]).mockReturnValueOnce(updateTransactions[1]);
            encodeTxSpy.mockReturnValue(encodedTransaction);

            const result = await prepareDaoContractsUpdateDialogUtils.buildPrepareUpdatePluginsTransaction({
                dao,
                plugins,
            });
            const expectedTransactions = updateTransactions.map((data) => ({ to: expectedTo, data, value: BigInt(0) }));
            expect(buildTxSpy).toHaveBeenNthCalledWith(1, dao, plugins[0]);
            expect(buildTxSpy).toHaveBeenNthCalledWith(2, dao, plugins[1]);
            expect(encodeTxSpy).toHaveBeenCalledWith(expectedTransactions, dao.network);
            expect(result).toEqual(encodedTransaction);
        });
    });

    describe('getApplyUpdateProposal', () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const buildActionsSpy = jest.spyOn(prepareDaoContractsUpdateDialogUtils as any, 'buildApplyUpdateTransactions');
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const buildMetaSpy = jest.spyOn(prepareDaoContractsUpdateDialogUtils as any, 'buildApplyUpdateMetadata');

        afterEach(() => {
            buildActionsSpy.mockReset();
            buildMetaSpy.mockReset();
        });

        afterAll(() => {
            buildActionsSpy.mockRestore();
            buildMetaSpy.mockRestore();
        });

        it('builds and return the apply udpate proposal actions and metadata', () => {
            const dao = generateDao();
            const plugins = [generateDaoPlugin()];
            const osxUpdate = true;
            const meta = { title: 'title', summary: 'summary', body: 'body' };
            const actions = [{ to: '0x', data: '0xdata', value: BigInt(0) }];
            buildActionsSpy.mockReturnValue(actions);
            buildMetaSpy.mockReturnValue(meta);

            const result = prepareDaoContractsUpdateDialogUtils.getApplyUpdateProposal({ dao, plugins, osxUpdate });
            expect(result).toEqual({ actions, ...meta, resources: [] });
            expect(buildActionsSpy).toHaveBeenCalledWith({ dao, plugins, osxUpdate });
            expect(buildMetaSpy).toHaveBeenCalledWith({ dao, plugins, osxUpdate });
        });
    });

    describe('buildPrepareUpdateTransaction', () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const buildPayloadSpy = jest.spyOn(prepareDaoContractsUpdateDialogUtils as any, 'buildPluginSetupPayload');

        afterEach(() => {
            buildPayloadSpy.mockReset();
        });

        afterAll(() => {
            buildPayloadSpy.mockRestore();
        });

        it('encodes the prepareUpdate transaction for the given plugin', () => {
            const dao = generateDao({ network: Network.ZKSYNC_MAINNET });
            const plugin = generateDaoPlugin({ subdomain: 'multi', release: '1', build: '4' });
            const pluginSetupRepo = '0xrepo';
            const newVersionTag = { release: 1, build: 5 };
            const pluginInfo = {
                id: 'multi',
                name: 'Multisig',
                installVersion: newVersionTag,
                repositoryAddresses: { [dao.network]: pluginSetupRepo },
            };
            const setupPayload = 'test';
            const transactionData = '0xupdate';
            getPluginSpy.mockReturnValue(pluginInfo);
            buildPayloadSpy.mockReturnValue(setupPayload);
            encodeFunctionDataSpy.mockReturnValue(transactionData);

            const result = prepareDaoContractsUpdateDialogUtils['buildPrepareUpdateTransaction'](dao, plugin);
            expect(getPluginSpy).toHaveBeenCalledWith(plugin.subdomain);
            expect(buildPayloadSpy).toHaveBeenCalledWith(dao, plugin);
            expect(encodeFunctionDataSpy).toHaveBeenCalledWith({
                abi: pluginSetupProcessorAbi,
                functionName: 'prepareUpdate',
                args: [
                    dao.address,
                    { currentVersionTag: { release: 1, build: 4 }, newVersionTag, pluginSetupRepo, setupPayload },
                ],
            });
            expect(result).toEqual(transactionData);
        });
    });

    describe('buildPluginSetupPayload', () => {
        it('builds the plugin-specific payload data for updating the plugin', () => {
            const dao = generateDao();
            const plugin = generateDaoPlugin({ address: '0x123', preparedSetupData: { helpers: ['0x1'] } });
            const initializeData = '0xdata';
            const dataBuilder = jest.fn(() => initializeData);
            getSlotFunctionSpy.mockReturnValue(dataBuilder);

            const result = prepareDaoContractsUpdateDialogUtils['buildPluginSetupPayload'](dao, plugin);
            expect(dataBuilder).toHaveBeenCalledWith({ dao, plugin });
            expect(result).toEqual({
                plugin: plugin.address,
                currentHelpers: plugin.preparedSetupData.helpers,
                data: initializeData,
            });
        });

        it('throws error when the plugin-specific data builder function is not registered', () => {
            const dao = generateDao();
            const plugin = generateDaoPlugin();
            getSlotFunctionSpy.mockReturnValue(undefined);
            expect(() => prepareDaoContractsUpdateDialogUtils['buildPluginSetupPayload'](dao, plugin)).toThrow();
        });
    });

    describe('buildApplyUpdateTransactions', () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const buildOsxSpy = jest.spyOn(prepareDaoContractsUpdateDialogUtils as any, 'buildOsxUpdateAction');

        afterEach(() => {
            buildOsxSpy.mockReset();
        });

        afterAll(() => {
            buildOsxSpy.mockRestore();
        });

        it('builds the osx-udpate transaction when osxUpdate parameter is set to true', () => {
            const params = { dao: generateDao(), plugins: [generateDaoPlugin()], osxUpdate: true };
            const osxUpdateTx = { to: '0x', data: '0xosx-update', value: BigInt(0) };
            buildOsxSpy.mockReturnValue(osxUpdateTx);
            const result = prepareDaoContractsUpdateDialogUtils['buildApplyUpdateTransactions'](params);
            expect(buildOsxSpy).toHaveBeenCalledWith(params.dao);
            expect(result).toEqual([osxUpdateTx]);
        });

        it('does not build the osx-update transaction when osxUpdate parameter is set to false', () => {
            const params = { dao: generateDao(), plugins: [generateDaoPlugin()], osxUpdate: false };
            prepareDaoContractsUpdateDialogUtils['buildApplyUpdateTransactions'](params);
            expect(buildOsxSpy).not.toHaveBeenCalled();
        });

        it('builds the plugin-update transactions when the prepare tx receipt is set', () => {
            const plugins = [generateDaoPlugin(), generateDaoPlugin()];
            const prepareUpdateReceipt = {} as Viem.TransactionReceipt;
            const pluginSetupData = [{ initData: '0x1' }, { initData: '0x2' }] as unknown as IPluginUpdateSetupData[];
            const updateTransactions = [
                { to: '0x', data: '0x1', value: BigInt(0) } as const,
                { to: '0x', data: '0x2', value: BigInt(0) } as const,
            ];
            const params = { dao: generateDao(), plugins, osxUpdate: false, prepareUpdateReceipt };
            getPluginUpdateSetupDataSpy.mockReturnValue(pluginSetupData);
            buildApplyPluginsUpdateActionsSpy.mockReturnValue(updateTransactions);

            const result = prepareDaoContractsUpdateDialogUtils['buildApplyUpdateTransactions'](params);
            expect(getPluginUpdateSetupDataSpy).toHaveBeenCalledWith(prepareUpdateReceipt);
            expect(buildApplyPluginsUpdateActionsSpy).toHaveBeenCalledWith({
                dao: params.dao,
                plugins,
                setupData: pluginSetupData,
            });
            expect(result).toEqual(updateTransactions);
        });
    });

    describe('buildOsxUpdateAction', () => {
        it('builds the transaction to update the protocol version of the DAO', () => {
            const dao = generateDao({ address: '0x123', network: Network.BASE_MAINNET, version: '2.1.1' });
            const initializeData = '0xinit';
            const upgradeData = '0xupgrade';
            encodeFunctionDataSpy.mockReturnValueOnce(initializeData).mockReturnValueOnce(upgradeData);

            const result = prepareDaoContractsUpdateDialogUtils['buildOsxUpdateAction'](dao);
            expect(encodeFunctionDataSpy).toHaveBeenNthCalledWith(1, {
                abi: daoAbi,
                functionName: 'initializeFrom',
                args: [[2, 1, 1], Viem.zeroHash],
            });
            expect(encodeFunctionDataSpy).toHaveBeenNthCalledWith(2, {
                abi: daoAbi,
                functionName: 'upgradeToAndCall',
                args: [networkDefinitions[dao.network].addresses.dao, initializeData],
            });
            expect(result).toEqual({ to: dao.address, data: upgradeData, value: BigInt(0) });
        });
    });

    describe('buildApplyUpdateMetadata', () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const summarySpy = jest.spyOn(prepareDaoContractsUpdateDialogUtils as any, 'getApplyUpdateSummaryMetadata');
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const bodySpy = jest.spyOn(prepareDaoContractsUpdateDialogUtils as any, 'getApplyUpdateBodyMetadata');

        afterEach(() => {
            summarySpy.mockReset();
            bodySpy.mockReset();
        });

        afterAll(() => {
            summarySpy.mockRestore();
            bodySpy.mockRestore();
        });

        it('builds the metadata for the update DAO contracts proposal', () => {
            const params = { dao: generateDao(), plugins: [generateDaoPlugin()], osxUpdate: false };
            const summary = 'summary';
            const body = 'body';
            summarySpy.mockReturnValue(summary);
            bodySpy.mockReturnValue(body);
            const result = prepareDaoContractsUpdateDialogUtils['buildApplyUpdateMetadata'](params);
            expect(summarySpy).toHaveBeenCalledWith(params.dao);
            expect(bodySpy).toHaveBeenCalledWith(params);
            expect(result).toEqual({ title: 'Aragon OSx contract upgrade', body, summary });
        });
    });

    describe('getApplyUpdateSummaryMetadata', () => {
        it('returns the summary of the update DAO contracts proposal', () => {
            const dao = generateDao({ name: 'My DAO' });
            const result = prepareDaoContractsUpdateDialogUtils['getApplyUpdateSummaryMetadata'](dao);
            expect(result).toMatch(/This proposal is an Aragon OSx Update for My DAO/);
        });
    });

    describe('getApplyUpdateBodyMetadata', () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const osxDetailsSpy = jest.spyOn(prepareDaoContractsUpdateDialogUtils as any, 'getOsxUpdateDetails');
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const pluginDetailsSpy = jest.spyOn(prepareDaoContractsUpdateDialogUtils as any, 'getPluginUpdateDetails');

        afterEach(() => {
            osxDetailsSpy.mockReset();
            pluginDetailsSpy.mockReset();
        });

        afterAll(() => {
            osxDetailsSpy.mockRestore();
            pluginDetailsSpy.mockRestore();
        });

        it('returns the body of the update DAO contracts proposal', () => {
            const plugins = [generateDaoPlugin(), generateDaoPlugin()];
            const params = { dao: generateDao(), plugins, osxUpdate: true };
            const osxUpdate = 'osx-update';
            const pluginsUpdate = ['plugin-1-update', 'plugin-2-update'];
            osxDetailsSpy.mockReturnValue(osxUpdate);
            pluginDetailsSpy.mockReturnValueOnce(pluginsUpdate[0]).mockReturnValueOnce(pluginsUpdate[1]);
            const result = prepareDaoContractsUpdateDialogUtils['getApplyUpdateBodyMetadata'](params);
            expect(osxDetailsSpy).toHaveBeenCalledWith(params.dao);
            expect(pluginDetailsSpy).toHaveBeenNthCalledWith(1, plugins[0]);
            expect(pluginDetailsSpy).toHaveBeenNthCalledWith(2, plugins[1]);
            expect(result).toContain(osxUpdate);
            expect(result).toContain(pluginsUpdate.join(' '));
        });

        it('does not includes the osx-updates details when the osxUpdate parameter is set to false', () => {
            const params = { dao: generateDao(), plugins: [generateDaoPlugin()], osxUpdate: false };
            prepareDaoContractsUpdateDialogUtils['getApplyUpdateBodyMetadata'](params);
            expect(osxDetailsSpy).not.toHaveBeenCalled();
        });
    });

    describe('getOsxUpdateDetails', () => {
        it('returns the details of the osx update', () => {
            const dao = generateDao({ network: Network.ETHEREUM_MAINNET, version: '1.3.1' });
            const originalDefinitions = networkDefinitions[dao.network];
            networkDefinitions[dao.network].protocolVersion.release = 2;
            networkDefinitions[dao.network].protocolVersion.build = 1;
            networkDefinitions[dao.network].protocolVersion.patch = 0;
            networkDefinitions[dao.network].protocolVersion.releaseNotes = 'https://github.com/notes';
            networkDefinitions[dao.network].protocolVersion.description = 'OSX-summary';
            const result = prepareDaoContractsUpdateDialogUtils['getOsxUpdateDetails'](dao);
            expect(result).toContain('Aragon OSx 2.1.0');
            expect(result).toContain(dao.version);
            expect(result).toContain('OSX-summary');
            expect(result).toContain(`https://github.com/notes`);
            networkDefinitions[dao.network] = originalDefinitions;
        });
    });

    describe('getPluginUpdateDetails', () => {
        it('returns the details of the plugin update', () => {
            const plugin = generateDaoPlugin({ subdomain: 'token-voting', release: '1', build: '1' });
            const pluginInfo = {
                id: 'plugin',
                name: 'Plugin',
                installVersion: { release: 1, build: 2, description: 'New-token', releaseNotes: 'https://releases' },
            };
            getPluginSpy.mockReturnValue(pluginInfo);
            const result = prepareDaoContractsUpdateDialogUtils['getPluginUpdateDetails'](plugin);
            expect(result).toContain('Token Voting 1.2');
            expect(result).toContain('Token Voting 1.1');
            expect(result).toContain('New-token');
            expect(result).toContain('https://releases');
        });
    });
});
