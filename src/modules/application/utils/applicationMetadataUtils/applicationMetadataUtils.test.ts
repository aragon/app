import { daoService } from '@/shared/api/daoService';
import { generateDao } from '@/shared/testUtils';
import { ipfsUtils } from '../../../../shared/utils/ipfsUtils';
import { applicationMetadataUtils } from './applicationMetadataUtils';

describe('applicationMetadata utils', () => {
    const getDaoSpy = jest.spyOn(daoService, 'getDao');
    const cidToSrcSpy = jest.spyOn(ipfsUtils, 'cidToSrc');

    afterEach(() => {
        getDaoSpy.mockReset();
        cidToSrcSpy.mockReset();
    });

    describe('generateDaoMetadata', () => {
        it('fetches the DAO with the given id and returns the relative title and description metadata', async () => {
            const dao = generateDao({ name: 'My DAO', description: 'Description' });
            getDaoSpy.mockResolvedValue(dao);

            const metadata = await applicationMetadataUtils.generateDaoMetadata({
                params: Promise.resolve({ addressOrEns: 'test-dao-address', network: 'test-network' }),
            });
            expect(metadata.title).toEqual(dao.name);
            expect(metadata.openGraph?.siteName).toEqual(`${dao.name} | Governed on Aragon`);
            expect(metadata.description).toEqual(dao.description);
        });

        it('processes the DAO avatar to return a full IPFS url', async () => {
            const dao = generateDao({ avatar: 'cidTest' });
            const ipfsUrl = `https://ipfs.com/ipfs/${dao.avatar!}`;
            getDaoSpy.mockResolvedValue(dao);
            cidToSrcSpy.mockReturnValue(ipfsUrl);

            const metadata = await applicationMetadataUtils.generateDaoMetadata({
                params: Promise.resolve({ addressOrEns: 'test-dao-id', network: 'test-network' }),
            });
            expect(cidToSrcSpy).toHaveBeenCalledWith(dao.avatar);
            expect(metadata.openGraph?.images).toEqual([ipfsUrl]);
        });

        it('returns undefined OG images when DAO has no avatar', async () => {
            const dao = generateDao({ avatar: undefined });
            getDaoSpy.mockResolvedValue(dao);

            const metadata = await applicationMetadataUtils.generateDaoMetadata({
                params: Promise.resolve({ addressOrEns: 'test-dao-id', network: 'test-network' }),
            });
            expect(metadata.openGraph?.images).toBeUndefined();
        });
    });
});
