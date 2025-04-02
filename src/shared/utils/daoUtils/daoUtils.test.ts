import { daoService } from '@/shared/api/daoService';
import { generateDao, generateDaoPlugin } from '@/shared/testUtils';
import { PluginType } from '@/shared/types';
import { addressUtils } from '@aragon/gov-ui-kit';
import { ipfsUtils } from '../ipfsUtils';
import { pluginRegistryUtils } from '../pluginRegistryUtils';
import { daoUtils } from './daoUtils';

describe('dao utils', () => {
    const getDaoSpy = jest.spyOn(daoService, 'getDao');
    const cidToSrcSpy = jest.spyOn(ipfsUtils, 'cidToSrc');
    const listContainsRegisteredPluginsSpy = jest.spyOn(pluginRegistryUtils, 'listContainsRegisteredPlugins');
    const isAddressEqualSpy = jest.spyOn(addressUtils, 'isAddressEqual');

    afterEach(() => {
        getDaoSpy.mockReset();
        cidToSrcSpy.mockReset();
        listContainsRegisteredPluginsSpy.mockReset();
        isAddressEqualSpy.mockReset();
    });

    describe('hasSupportedPlugins', () => {
        it('returns true when dao has supported plugins', () => {
            listContainsRegisteredPluginsSpy.mockReturnValue(true);
            const daoPlugins = [generateDaoPlugin({ subdomain: '000' }), generateDaoPlugin({ subdomain: '001' })];
            const dao = generateDao({ plugins: daoPlugins });
            expect(daoUtils.hasSupportedPlugins(dao)).toBeTruthy();
            expect(listContainsRegisteredPluginsSpy).toHaveBeenCalledWith(['000', '001']);
        });

        it('returns false when dao does not have supported plugins', () => {
            listContainsRegisteredPluginsSpy.mockReturnValue(false);
            const daoPlugins = [generateDaoPlugin({ subdomain: 'abc' })];
            const dao = generateDao({ plugins: daoPlugins });
            expect(daoUtils.hasSupportedPlugins(dao)).toBeFalsy();
        });

        it('returns false when dao parameter is not defined', () => {
            listContainsRegisteredPluginsSpy.mockReturnValue(false);
            expect(daoUtils.hasSupportedPlugins()).toBeFalsy();
        });
    });

    describe('getDaoEns', () => {
        it('returns the full DAO ens from the given subdomain', () => {
            const dao = generateDao({ subdomain: 'my-dao' });
            expect(daoUtils.getDaoEns(dao)).toEqual('my-dao.dao.eth');
        });

        it('returns undefined when dao parameter is not defined', () => {
            expect(daoUtils.getDaoEns(undefined)).toBeUndefined();
        });

        it('returns undefined when dao subdomain is null or empty string', () => {
            const nullSubdomain = generateDao({ subdomain: null });
            const emptySubdomain = generateDao({ subdomain: '' });
            expect(daoUtils.getDaoEns(nullSubdomain)).toBeUndefined();
            expect(daoUtils.getDaoEns(emptySubdomain)).toBeUndefined();
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
            const plugins = [generateDaoPlugin({ subdomain: 'a' }), generateDaoPlugin({ subdomain: 'b' })];
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
                generateDaoPlugin({ subdomain: 'spp', isBody: false }),
                generateDaoPlugin({ subdomain: 'multisig', isBody: true }),
                generateDaoPlugin({ subdomain: 'token', isBody: true }),
            ];
            const dao = generateDao({ plugins });
            const type = PluginType.BODY;
            expect(daoUtils.getDaoPlugins(dao, { type })).toEqual([plugins[1], plugins[2]]);
        });

        it('only returns process plugins that are not sub-plugins when plugin type is set to process', () => {
            const plugins = [
                generateDaoPlugin({ subdomain: 'spp', isProcess: true, isSubPlugin: false }),
                generateDaoPlugin({ subdomain: 'multisig', isProcess: true, isSubPlugin: false }),
                generateDaoPlugin({ subdomain: 'spp', isProcess: true, isSubPlugin: true }),
            ];
            const dao = generateDao({ plugins });
            const type = PluginType.PROCESS;
            expect(daoUtils.getDaoPlugins(dao, { type })).toEqual([plugins[0], plugins[1]]);
        });

        it('includes sub-plugins when includeSubPlugins is true', () => {
            const plugins = [
                generateDaoPlugin({ subdomain: 'spp', isProcess: true, isSubPlugin: false }),
                generateDaoPlugin({ subdomain: 'multisig', isProcess: true, isSubPlugin: false }),
                generateDaoPlugin({ subdomain: 'sub-plugin', isProcess: true, isSubPlugin: true }),
            ];
            const dao = generateDao({ plugins });
            expect(daoUtils.getDaoPlugins(dao, { includeSubPlugins: true })).toEqual(plugins);
        });

        it('excludes sub-plugins when includeSubPlugins is false', () => {
            const plugins = [
                generateDaoPlugin({ subdomain: 'spp', isProcess: true, isSubPlugin: false }),
                generateDaoPlugin({ subdomain: 'multisig', isProcess: true, isSubPlugin: false }),
                generateDaoPlugin({ subdomain: 'sub-plugin', isProcess: true, isSubPlugin: true }),
            ];
            const dao = generateDao({ plugins });
            expect(daoUtils.getDaoPlugins(dao, { includeSubPlugins: false })).toEqual([plugins[0], plugins[1]]);
        });

        it('correctly filters by type and includes sub-plugins when specified', () => {
            const plugins = [
                generateDaoPlugin({ subdomain: 'spp', isProcess: true, isSubPlugin: false }),
                generateDaoPlugin({ subdomain: 'token', isBody: true, isSubPlugin: false }),
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

        it('only returns the plugin with the specified subdomain', () => {
            const plugins = [
                generateDaoPlugin({ subdomain: 'pluginA' }),
                generateDaoPlugin({ subdomain: 'pluginB' }),
                generateDaoPlugin({ subdomain: 'pluginC' }),
            ];
            const dao = generateDao({ plugins });
            const subdomain = 'pluginB';
            expect(daoUtils.getDaoPlugins(dao, { subdomain })).toEqual([plugins[1]]);
        });

        it('returns an empty array when no plugin matches the specified subdomain', () => {
            const plugins = [generateDaoPlugin({ subdomain: 'pluginA' }), generateDaoPlugin({ subdomain: 'pluginB' })];
            const dao = generateDao({ plugins });
            const subdomain = 'pluginC';
            expect(daoUtils.getDaoPlugins(dao, { subdomain })).toEqual([]);
        });

        it('returns all plugins with the specified subdomain when multiple plugins share the same subdomain', () => {
            const plugins = [
                generateDaoPlugin({ subdomain: 'sharedSubdomain', address: '0x1' }),
                generateDaoPlugin({ subdomain: 'sharedSubdomain', address: '0x2' }),
                generateDaoPlugin({ subdomain: 'uniqueSubdomain', address: '0x3' }),
            ];
            const dao = generateDao({ plugins });
            const subdomain = 'sharedSubdomain';
            expect(daoUtils.getDaoPlugins(dao, { subdomain })).toEqual([plugins[0], plugins[1]]);
        });

        it('returns undefined when dao parameter is not defined', () => {
            expect(daoUtils.getDaoPlugins(undefined)).toBeUndefined();
        });
    });
});
