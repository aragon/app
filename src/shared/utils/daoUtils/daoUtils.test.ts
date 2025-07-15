import { daoService, Network, PluginInterfaceType } from '@/shared/api/daoService';
import { networkDefinitions } from '@/shared/constants/networkDefinitions';
import { generateDao, generateDaoPlugin } from '@/shared/testUtils';
import { type IPluginInfo, PluginType } from '@/shared/types';
import { addressUtils } from '@aragon/gov-ui-kit';
import { ipfsUtils } from '../ipfsUtils';
import { pluginRegistryUtils } from '../pluginRegistryUtils';
import { daoUtils } from './daoUtils';

describe('dao utils', () => {
    const getDaoSpy = jest.spyOn(daoService, 'getDao');
    const getDaoByEnsSpy = jest.spyOn(daoService, 'getDaoByEns');
    const cidToSrcSpy = jest.spyOn(ipfsUtils, 'cidToSrc');
    const listContainsRegisteredPluginsSpy = jest.spyOn(pluginRegistryUtils, 'listContainsRegisteredPlugins');
    const isAddressEqualSpy = jest.spyOn(addressUtils, 'isAddressEqual');
    const getPluginsSpy = jest.spyOn(pluginRegistryUtils, 'getPlugins');

    afterEach(() => {
        getDaoSpy.mockReset();
        getDaoByEnsSpy.mockReset();
        cidToSrcSpy.mockReset();
        listContainsRegisteredPluginsSpy.mockReset();
        isAddressEqualSpy.mockReset();
        getPluginsSpy.mockReset();
    });

    describe('hasSupportedPlugins', () => {
        it('returns true when dao has supported plugins', () => {
            listContainsRegisteredPluginsSpy.mockReturnValue(true);
            const daoPlugins = [
                generateDaoPlugin({ interfaceType: PluginInterfaceType.UNKNOWN }),
                generateDaoPlugin({ interfaceType: PluginInterfaceType.SPP }),
            ];
            const dao = generateDao({ plugins: daoPlugins });
            expect(daoUtils.hasSupportedPlugins(dao)).toBeTruthy();
            expect(listContainsRegisteredPluginsSpy).toHaveBeenCalledWith([
                PluginInterfaceType.UNKNOWN,
                PluginInterfaceType.SPP,
            ]);
        });

        it('returns false when dao does not have supported plugins', () => {
            listContainsRegisteredPluginsSpy.mockReturnValue(false);
            const daoPlugins = [generateDaoPlugin()];
            const dao = generateDao({ plugins: daoPlugins });
            expect(daoUtils.hasSupportedPlugins(dao)).toBeFalsy();
        });

        it('returns false when dao parameter is not defined', () => {
            listContainsRegisteredPluginsSpy.mockReturnValue(false);
            expect(daoUtils.hasSupportedPlugins()).toBeFalsy();
        });
    });

    describe('getDaoEns', () => {
        it('returns the DAO ens when defined', () => {
            const dao = generateDao({ ens: 'my-dao.dao.eth' });
            expect(daoUtils.getDaoEns(dao)).toEqual('my-dao.dao.eth');
        });

        it('returns undefined when dao parameter is not defined', () => {
            expect(daoUtils.getDaoEns(undefined)).toBeUndefined();
        });

        it('returns undefined when dao ens is null or empty string', () => {
            const nullEns = generateDao({ ens: null });
            const emptyEns = generateDao({ ens: '' });
            expect(daoUtils.getDaoEns(nullEns)).toBeUndefined();
            expect(daoUtils.getDaoEns(emptyEns)).toBeUndefined();
        });
    });

    describe('getPluginName', () => {
        it('formats plugin subdomain', () => {
            const subdomain = 'token-voting';
            const plugin = generateDaoPlugin({ subdomain });
            expect(daoUtils.getPluginName(plugin)).toEqual('Token Voting');
        });

        it('returns plugin name when available', () => {
            const name = 'Custom plugin';
            const plugin = generateDaoPlugin({ name });
            expect(daoUtils.getPluginName(plugin)).toEqual(name);
        });
    });

    describe('getDaoPlugin', () => {
        it('returns all dao plugins by default', () => {
            const plugins = [generateDaoPlugin(), generateDaoPlugin()];
            const dao = generateDao({ plugins });
            expect(daoUtils.getDaoPlugins(dao)).toEqual(plugins);
        });

        it('only returns the plugin with the specified address', () => {
            const pluginAddress = '0x7249387';
            const plugins = [generateDaoPlugin({ address: '0x123' }), generateDaoPlugin({ address: pluginAddress })];
            const dao = generateDao({ plugins });
            isAddressEqualSpy.mockReturnValueOnce(false).mockReturnValueOnce(true);
            expect(daoUtils.getDaoPlugins(dao, { pluginAddress })).toEqual([plugins[1]]);
        });

        it('only returns body plugins when plugin type is set to body', () => {
            const plugins = [
                generateDaoPlugin({ interfaceType: PluginInterfaceType.SPP, isBody: false }),
                generateDaoPlugin({ interfaceType: PluginInterfaceType.MULTISIG, isBody: true }),
                generateDaoPlugin({ interfaceType: PluginInterfaceType.TOKEN_VOTING, isBody: true }),
            ];
            const dao = generateDao({ plugins });
            const type = PluginType.BODY;
            expect(daoUtils.getDaoPlugins(dao, { type })).toEqual([plugins[1], plugins[2]]);
        });

        it('only returns process plugins that are not sub-plugins when plugin type is set to process', () => {
            const plugins = [
                generateDaoPlugin({ interfaceType: PluginInterfaceType.SPP, isProcess: true, isSubPlugin: false }),
                generateDaoPlugin({ interfaceType: PluginInterfaceType.MULTISIG, isProcess: true, isSubPlugin: false }),
                generateDaoPlugin({
                    interfaceType: PluginInterfaceType.TOKEN_VOTING,
                    isProcess: true,
                    isSubPlugin: true,
                }),
            ];
            const dao = generateDao({ plugins });
            const type = PluginType.PROCESS;
            expect(daoUtils.getDaoPlugins(dao, { type })).toEqual([plugins[0], plugins[1]]);
        });

        it('includes sub-plugins when includeSubPlugins is true', () => {
            const plugins = [
                generateDaoPlugin({ interfaceType: PluginInterfaceType.SPP, isProcess: true, isSubPlugin: false }),
                generateDaoPlugin({ interfaceType: PluginInterfaceType.MULTISIG, isProcess: true, isSubPlugin: false }),
                generateDaoPlugin({ subdomain: 'sub-plugin', isProcess: true, isSubPlugin: true }),
            ];
            const dao = generateDao({ plugins });
            expect(daoUtils.getDaoPlugins(dao, { includeSubPlugins: true })).toEqual(plugins);
        });

        it('excludes sub-plugins when includeSubPlugins is false', () => {
            const plugins = [
                generateDaoPlugin({ interfaceType: PluginInterfaceType.SPP, isProcess: true, isSubPlugin: false }),
                generateDaoPlugin({ interfaceType: PluginInterfaceType.MULTISIG, isProcess: true, isSubPlugin: false }),
                generateDaoPlugin({ subdomain: 'sub-plugin', isProcess: true, isSubPlugin: true }),
            ];
            const dao = generateDao({ plugins });
            expect(daoUtils.getDaoPlugins(dao, { includeSubPlugins: false })).toEqual([plugins[0], plugins[1]]);
        });

        it('correctly filters by type and includes sub-plugins when specified', () => {
            const plugins = [
                generateDaoPlugin({ interfaceType: PluginInterfaceType.SPP, isProcess: true, isSubPlugin: false }),
                generateDaoPlugin({
                    interfaceType: PluginInterfaceType.TOKEN_VOTING,
                    isBody: true,
                    isSubPlugin: false,
                }),
                generateDaoPlugin({ subdomain: 'sub-process', isProcess: true, isSubPlugin: true }),
                generateDaoPlugin({ subdomain: 'sub-body', isBody: true, isSubPlugin: true }),
            ];
            const dao = generateDao({ plugins });
            expect(daoUtils.getDaoPlugins(dao, { type: PluginType.PROCESS, includeSubPlugins: true })).toEqual([
                plugins[0],
                plugins[2],
            ]);
            expect(daoUtils.getDaoPlugins(dao, { type: PluginType.BODY, includeSubPlugins: true })).toEqual([
                plugins[1],
                plugins[3],
            ]);
        });

        it('only returns the plugin with the specified interface type', () => {
            const plugins = [
                generateDaoPlugin({ interfaceType: PluginInterfaceType.ADMIN }),
                generateDaoPlugin({ interfaceType: PluginInterfaceType.MULTISIG }),
                generateDaoPlugin({ interfaceType: PluginInterfaceType.SPP }),
            ];
            const dao = generateDao({ plugins });
            const interfaceType = PluginInterfaceType.MULTISIG;
            expect(daoUtils.getDaoPlugins(dao, { interfaceType })).toEqual([plugins[1]]);
        });

        it('returns an empty array when no plugin matches the specified interface type', () => {
            const plugins = [
                generateDaoPlugin({ interfaceType: PluginInterfaceType.ADMIN }),
                generateDaoPlugin({ interfaceType: PluginInterfaceType.MULTISIG }),
            ];
            const dao = generateDao({ plugins });
            const interfaceType = PluginInterfaceType.UNKNOWN;
            expect(daoUtils.getDaoPlugins(dao, { interfaceType })).toEqual([]);
        });

        it('returns all plugins with the specified interface type when multiple plugins share the same type', () => {
            const plugins = [
                generateDaoPlugin({ interfaceType: PluginInterfaceType.MULTISIG, address: '0x1' }),
                generateDaoPlugin({ interfaceType: PluginInterfaceType.MULTISIG, address: '0x2' }),
                generateDaoPlugin({ interfaceType: PluginInterfaceType.ADMIN, address: '0x3' }),
            ];
            const dao = generateDao({ plugins });
            const interfaceType = PluginInterfaceType.MULTISIG;
            expect(daoUtils.getDaoPlugins(dao, { interfaceType })).toEqual([plugins[0], plugins[1]]);
        });

        it('returns undefined when dao parameter is not defined', () => {
            expect(daoUtils.getDaoPlugins(undefined)).toBeUndefined();
        });
    });

    describe('hasAvailableUpdates', () => {
        const hasAvailableOsxUpdateSpy = jest.spyOn(daoUtils, 'hasAvailableOsxUpdate');
        const getAvailablePluginUpdates = jest.spyOn(daoUtils, 'getAvailablePluginUpdates');

        afterEach(() => {
            hasAvailableOsxUpdateSpy.mockReset();
            getAvailablePluginUpdates.mockReset();
        });

        afterAll(() => {
            hasAvailableOsxUpdateSpy.mockRestore();
            getAvailablePluginUpdates.mockRestore();
        });

        it('returns an object containing information about the available updates for the DAO', () => {
            const dao = generateDao();
            hasAvailableOsxUpdateSpy.mockReturnValue(true);
            getAvailablePluginUpdates.mockReturnValue([]);
            const result = daoUtils.hasAvailableUpdates(dao);
            expect(result.osx).toBeTruthy();
            expect(result.plugins).toBeFalsy();
        });

        it('returns true for plugins update when DAO has plugins with available updates', () => {
            const dao = generateDao();
            getAvailablePluginUpdates.mockReturnValue([generateDaoPlugin()]);
            expect(daoUtils.hasAvailableUpdates(dao).plugins).toBeTruthy();
        });
    });

    describe('hasAvailableOsxUpdate', () => {
        it('returns true when dao protocol version is lower than the version installed for new DAOs', () => {
            const dao = generateDao({ version: '1.5.0', network: Network.ETHEREUM_MAINNET });
            const original = networkDefinitions[dao.network].protocolVersion;
            networkDefinitions[dao.network].protocolVersion.release = 1;
            networkDefinitions[dao.network].protocolVersion.build = 6;
            expect(daoUtils.hasAvailableOsxUpdate(dao)).toBeTruthy();
            networkDefinitions[dao.network].protocolVersion = original;
        });

        it('returns false when dao protocol version is equal to the version installed for new DAOs', () => {
            const dao = generateDao({ version: '2.1.0', network: Network.ETHEREUM_MAINNET });
            const original = networkDefinitions[dao.network].protocolVersion;
            networkDefinitions[dao.network].protocolVersion.release = 2;
            networkDefinitions[dao.network].protocolVersion.build = 1;
            expect(daoUtils.hasAvailableOsxUpdate(dao)).toBeFalsy();
            networkDefinitions[dao.network].protocolVersion = original;
        });

        it('returns false when dao is not defined', () => {
            expect(daoUtils.hasAvailableOsxUpdate(undefined)).toBeFalsy();
        });
    });

    describe('getAvailablePluginUpdates', () => {
        it('returns the list of plugins that can be updated', () => {
            const plugins = [
                generateDaoPlugin({
                    interfaceType: PluginInterfaceType.TOKEN_VOTING,
                    subdomain: 'token-voting',
                    release: '1',
                    build: '1',
                }),
                generateDaoPlugin({
                    interfaceType: PluginInterfaceType.TOKEN_VOTING,
                    subdomain: 'token-voting-test-deployment', // Example of a DAO plugin with an unknown subdomain ... it should not be returned!
                    release: '1',
                    build: '1',
                }),
                generateDaoPlugin({
                    interfaceType: PluginInterfaceType.MULTISIG,
                    subdomain: 'multisig',
                    release: '1',
                    build: '1',
                }),
                generateDaoPlugin({
                    interfaceType: PluginInterfaceType.ADMIN,
                    subdomain: 'admin',
                    release: '2',
                    build: '1',
                }),
            ];
            const dao = generateDao({ plugins });
            const multisigPluginInfo = {
                subdomain: 'multisig',
                installVersion: { release: 1, build: 2 },
            } as IPluginInfo;
            const adminPluginInfo = {
                subdomain: 'admin',
                installVersion: { release: 1, build: 1 },
            } as IPluginInfo;
            const tokenPluginInfo = {
                subdomain: 'token-voting',
                installVersion: { release: 3, build: 0 },
            } as IPluginInfo;

            getPluginsSpy.mockReturnValue([multisigPluginInfo, adminPluginInfo, tokenPluginInfo]);
            const result = daoUtils.getAvailablePluginUpdates(dao);

            expect(result).toEqual([plugins[0], plugins[2]]);
        });

        it('returns empty array when dao is not defined', () => {
            expect(daoUtils.getAvailablePluginUpdates(undefined)).toEqual([]);
        });
    });

    describe('parsePluginSubdomain', () => {
        it('correctly parses the plugin subdomain when it has a hyphen', () => {
            const subdomain = 'token-voting';
            const expectedResult = 'Token Voting';

            expect(daoUtils.parsePluginSubdomain(subdomain)).toEqual(expectedResult);
        });

        it('correctly parses the plugin subdomain when it has multiple hyphens', () => {
            const subdomain = 'token-voting-plugin';
            const expectedResult = 'Token Voting Plugin';
            expect(daoUtils.parsePluginSubdomain(subdomain)).toEqual(expectedResult);
        });

        it('correctly parses the plugin subdomain when it has no hyphen', () => {
            const subdomain = 'multisig';
            const expectedResult = 'Multisig';
            expect(daoUtils.parsePluginSubdomain(subdomain)).toEqual(expectedResult);
        });
    });

    describe('resolveDaoId', () => {
        it('returns the daoId when the id is an address', async () => {
            const addressOrEns = '0x1234';
            const network = Network.ETHEREUM_MAINNET;
            const params = { addressOrEns, network };
            const expectedDaoId = `${network}-${addressOrEns}`;

            const result = await daoUtils.resolveDaoId(params);
            expect(result).toEqual(expectedDaoId);
        });

        it('returns the daoId when the id is an ENS name by resolving name to address', async () => {
            const addressOrEns = 'my-dao.dao.eth';
            const daoAddress = '0x1234';
            const network = Network.ETHEREUM_MAINNET;
            const params = { addressOrEns, network };
            const expectedDaoId = `${network}-${daoAddress}`;
            getDaoByEnsSpy.mockResolvedValue(generateDao({ address: daoAddress, network }));

            const result = await daoUtils.resolveDaoId(params);

            expect(getDaoByEnsSpy).toHaveBeenCalledWith({ urlParams: { network, ens: addressOrEns } });
            expect(result).toEqual(expectedDaoId);
        });
    });

    describe('parseDaoId', () => {
        it('correctly parses a daoId with network and address', () => {
            const daoId = 'ethereum-mainnet-0x12345';
            const expectedResult = { network: Network.ETHEREUM_MAINNET, address: '0x12345' };
            expect(daoUtils.parseDaoId(daoId)).toEqual(expectedResult);
        });
    });

    describe('getDaoUrl', () => {
        it('returns the correct base URL for a DAO with ENS', () => {
            const daoEns = 'test-dao.dao.eth';
            const daoNetwork = Network.ETHEREUM_MAINNET;
            const dao = generateDao({ ens: daoEns, network: daoNetwork });
            const expectedUrl = `/dao/${daoNetwork}/${daoEns}`;
            expect(daoUtils.getDaoUrl(dao)).toEqual(expectedUrl);
        });

        it('returns the correct base URL for a DAO without ENS', () => {
            const daoAddress = '0x12345';
            const daoNetwork = Network.ETHEREUM_MAINNET;
            const dao = generateDao({ address: daoAddress, network: daoNetwork });
            const expectedUrl = `/dao/${daoNetwork}/${daoAddress}`;
            expect(daoUtils.getDaoUrl(dao)).toEqual(expectedUrl);
        });

        it('appends the provided path to the base URL', () => {
            const daoAddress = '0x12345';
            const daoNetwork = Network.ETHEREUM_MAINNET;
            const dao = generateDao({ address: daoAddress, network: daoNetwork });
            const path = 'some/path';
            const expectedUrl = `/dao/${daoNetwork}/${daoAddress}/${path}`;
            expect(daoUtils.getDaoUrl(dao, path)).toEqual(expectedUrl);
        });

        it('returns undefined when dao parameter is not defined', () => {
            expect(daoUtils.getDaoUrl(undefined)).toBeUndefined();
        });
    });
});
