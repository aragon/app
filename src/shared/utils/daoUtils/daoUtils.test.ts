import { daoService } from '@/shared/api/daoService';
import { generateDao, generateDaoPlugin } from '@/shared/testUtils';
import { ipfsUtils } from '../ipfsUtils';
import { pluginRegistryUtils } from '../pluginRegistryUtils';
import { daoUtils } from './daoUtils';

describe('dao utils', () => {
    const getDaoSpy = jest.spyOn(daoService, 'getDao');
    const cidToSrcSpy = jest.spyOn(ipfsUtils, 'cidToSrc');
    const listContainsRegisteredPluginsSpy = jest.spyOn(pluginRegistryUtils, 'listContainsRegisteredPlugins');

    afterEach(() => {
        getDaoSpy.mockReset();
        cidToSrcSpy.mockReset();
        listContainsRegisteredPluginsSpy.mockReset();
    });

    describe('generateMetadata', () => {
        it('fetches the DAO with the given id and returns the relative title and description metadata', async () => {
            const id = 'eth-mainnet-my-dao';
            const dao = generateDao({ name: 'My DAO', description: 'Description' });
            getDaoSpy.mockResolvedValue(dao);

            const metadata = await daoUtils.generateMetadata({ params: { id } });
            expect(metadata.title).toEqual(dao.name);
            expect(metadata.description).toEqual(dao.description);
        });

        it('processes the DAO avatar to return a full IPFS url', async () => {
            const dao = generateDao({ avatar: 'cidTest' });
            const ipfsUrl = `https://ipfs.com/ipfs/${dao.avatar}`;
            getDaoSpy.mockResolvedValue(dao);
            cidToSrcSpy.mockReturnValue(ipfsUrl);

            const metadata = await daoUtils.generateMetadata({ params: { id: 'test' } });
            expect(cidToSrcSpy).toHaveBeenCalledWith(dao.avatar);
            expect(metadata.openGraph?.images).toEqual([ipfsUrl]);
        });

        it('returns undefined OG images when DAO has no avatar', async () => {
            const dao = generateDao({ avatar: undefined });
            getDaoSpy.mockResolvedValue(dao);

            const metadata = await daoUtils.generateMetadata({ params: { id: 'test' } });
            expect(metadata.openGraph?.images).toBeUndefined();
        });
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
    });
});
