import { AragonBackendServiceError } from '@/shared/api/aragonBackendService';
import { daoService, Network } from '@/shared/api/daoService';
import { generateDao } from '@/shared/testUtils';
import { monitoringUtils } from '@/shared/utils/monitoringUtils';
import { ipfsUtils } from '../../../../shared/utils/ipfsUtils';
import { applicationMetadataUtils } from './applicationMetadataUtils';

describe('applicationMetadata utils', () => {
    const getDaoSpy = jest.spyOn(daoService, 'getDao');
    const cidToSrcSpy = jest.spyOn(ipfsUtils, 'cidToSrc');
    const logErrorSpy = jest.spyOn(monitoringUtils, 'logError');

    afterEach(() => {
        getDaoSpy.mockReset();
        cidToSrcSpy.mockReset();
        logErrorSpy.mockReset();
    });

    describe('generateDaoMetadata', () => {
        it('fetches the DAO with the given id and returns the relative title and description metadata', async () => {
            const dao = generateDao({
                name: 'My DAO',
                description: 'Description',
            });
            getDaoSpy.mockResolvedValue(dao);

            const metadata = await applicationMetadataUtils.generateDaoMetadata(
                {
                    params: Promise.resolve({
                        addressOrEns: 'test-dao-address',
                        network: Network.ETHEREUM_SEPOLIA,
                    }),
                },
            );
            expect(metadata.title).toEqual(dao.name);
            expect(metadata.openGraph?.siteName).toEqual(
                `${dao.name} | Governed on Aragon`,
            );
            expect(metadata.description).toEqual(dao.description);
        });

        it('processes the DAO avatar to return a full IPFS url', async () => {
            const dao = generateDao({ avatar: 'cidTest' });
            const ipfsUrl = `https://ipfs.com/ipfs/${dao.avatar!}`;
            getDaoSpy.mockResolvedValue(dao);
            cidToSrcSpy.mockReturnValue(ipfsUrl);

            const metadata = await applicationMetadataUtils.generateDaoMetadata(
                {
                    params: Promise.resolve({
                        addressOrEns: 'test-dao-id',
                        network: Network.ETHEREUM_SEPOLIA,
                    }),
                },
            );
            expect(cidToSrcSpy).toHaveBeenCalledWith(dao.avatar);
            expect(metadata.openGraph?.images).toEqual([ipfsUrl]);
        });

        it('does not log to monitoring when the DAO is not found', async () => {
            const notFoundError = new AragonBackendServiceError(
                AragonBackendServiceError.notFoundCode,
                'Resource not found',
                404,
            );
            getDaoSpy.mockRejectedValue(notFoundError);

            const metadata = await applicationMetadataUtils.generateDaoMetadata(
                {
                    params: Promise.resolve({
                        addressOrEns: 'unknown-dao',
                        network: Network.ETHEREUM_SEPOLIA,
                    }),
                },
            );

            expect(metadata.title).toEqual('DAO not found');
            expect(logErrorSpy).not.toHaveBeenCalled();
        });

        it('logs to monitoring when an unexpected error occurs', async () => {
            const error = new Error('boom');
            getDaoSpy.mockRejectedValue(error);

            await applicationMetadataUtils.generateDaoMetadata({
                params: Promise.resolve({
                    addressOrEns: 'test-dao-id',
                    network: Network.ETHEREUM_SEPOLIA,
                }),
            });

            expect(logErrorSpy).toHaveBeenCalledWith(error);
        });

        it('returns undefined OG images when DAO has no avatar', async () => {
            const dao = generateDao({ avatar: undefined });
            getDaoSpy.mockResolvedValue(dao);

            const metadata = await applicationMetadataUtils.generateDaoMetadata(
                {
                    params: Promise.resolve({
                        addressOrEns: 'test-dao-id',
                        network: Network.ETHEREUM_SEPOLIA,
                    }),
                },
            );
            expect(metadata.openGraph?.images).toBeUndefined();
        });
    });
});
