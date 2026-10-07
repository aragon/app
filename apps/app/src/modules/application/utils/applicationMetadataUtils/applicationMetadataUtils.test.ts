import { headers } from 'next/headers';
import { AragonBackendServiceError } from '@/shared/api/aragonBackendService';
import { daoService, Network } from '@/shared/api/daoService';
import { generateDao } from '@/shared/testUtils';
import { monitoringUtils } from '@/shared/utils/monitoringUtils';
import { ipfsUtils } from '../../../../shared/utils/ipfsUtils';
import { applicationMetadataUtils } from './applicationMetadataUtils';

jest.mock('next/headers', () => ({ headers: jest.fn() }));

describe('applicationMetadata utils', () => {
    const getDaoSpy = jest.spyOn(daoService, 'getDao');
    const cidToSrcSpy = jest.spyOn(ipfsUtils, 'cidToSrc');
    const logErrorSpy = jest.spyOn(monitoringUtils, 'logError');
    const logMessageSpy = jest.spyOn(monitoringUtils, 'logMessage');
    const headersMock = jest.mocked(headers);

    const daoAddress = '0x1234567890123456789012345678901234567890';

    const mockReferer = (referer?: string) =>
        headersMock.mockResolvedValue({
            get: (name: string) =>
                name === 'referer' ? (referer ?? null) : null,
        } as never);

    beforeEach(() => {
        logMessageSpy.mockImplementation(jest.fn());
    });

    afterEach(() => {
        getDaoSpy.mockReset();
        cidToSrcSpy.mockReset();
        logErrorSpy.mockReset();
        logMessageSpy.mockReset();
        headersMock.mockReset();
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
                        addressOrEns: daoAddress,
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
                        addressOrEns: daoAddress,
                        network: Network.ETHEREUM_SEPOLIA,
                    }),
                },
            );
            expect(cidToSrcSpy).toHaveBeenCalledWith(dao.avatar);
            expect(metadata.openGraph?.images).toEqual([ipfsUrl]);
        });

        // A malformed address never reaches the backend: resolveDaoId renders the 404 page and
        // the catch block lets that navigation signal through instead of building fallback metadata.
        it('renders the 404 page for a malformed DAO address without fetching the DAO', async () => {
            const metadata = applicationMetadataUtils.generateDaoMetadata({
                params: Promise.resolve({
                    addressOrEns: '0x1234-1) OR 1=1--',
                    network: Network.ETHEREUM_SEPOLIA,
                }),
            });

            await expect(metadata).rejects.toThrow(
                'NEXT_HTTP_ERROR_FALLBACK;404',
            );
            expect(getDaoSpy).not.toHaveBeenCalled();
            expect(logErrorSpy).not.toHaveBeenCalled();
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
                        addressOrEns: daoAddress,
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
                    addressOrEns: daoAddress,
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
                        addressOrEns: daoAddress,
                        network: Network.ETHEREUM_SEPOLIA,
                    }),
                },
            );
            expect(metadata.openGraph?.images).toBeUndefined();
        });
    });

    describe('generateDaoMetadata on an unknown network', () => {
        const generateMetadata = () =>
            applicationMetadataUtils.generateDaoMetadata({
                params: Promise.resolve({
                    network: 'polygon-mainnet-0x1234' as Network,
                    addressOrEns: 'settings',
                }),
            });

        it('returns the invalid-url metadata without fetching the DAO', async () => {
            mockReferer();
            const metadata = await generateMetadata();
            expect(metadata.title).toEqual('Invalid DAO URL');
            expect(getDaoSpy).not.toHaveBeenCalled();
        });

        it('flags a link from a page of our app as an internal broken link', async () => {
            mockReferer(
                'https://app.aragon.org/dao/polygon-mainnet/0x1234/settings',
            );
            await generateMetadata();
            expect(logMessageSpy).toHaveBeenCalledWith(
                'Invalid DAO URL',
                expect.objectContaining({
                    level: 'warning',
                    noiseClass: 'internal-broken-link',
                }),
            );
        });

        it('treats a referer that is itself a malformed DAO URL as probe traffic', async () => {
            mockReferer(
                'https://app.aragon.org/dao/polygon-mainnet-0x1234/settings',
            );
            await generateMetadata();
            expect(logMessageSpy).toHaveBeenCalledWith(
                'Invalid DAO URL',
                expect.objectContaining({
                    level: 'info',
                    noiseClass: 'security-probe',
                }),
            );
        });

        it('treats an external or missing referer as probe traffic', async () => {
            mockReferer('https://example.com/some-page');
            await generateMetadata();
            mockReferer();
            await generateMetadata();
            expect(logMessageSpy).toHaveBeenCalledTimes(2);
            logMessageSpy.mock.calls.forEach(([, params]) => {
                expect(params?.noiseClass).toEqual('security-probe');
                expect(params?.level).toEqual('info');
            });
        });
    });
});
