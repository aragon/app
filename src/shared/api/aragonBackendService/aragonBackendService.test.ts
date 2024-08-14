import { generatePaginatedResponse, generatePaginatedResponseMetadata, generateResponse } from '@/shared/testUtils';
import { AragonBackendService } from './aragonBackendService';
import { AragonBackendServiceError } from './aragonBackendServiceError';

class ServiceTest extends AragonBackendService {}

describe('AragonBackend service', () => {
    const originalEnvUrl = process.env.NEXT_PUBLIC_ARAGAGON_BACKEND_URL;
    let serviceTest = new ServiceTest();

    const fetchSpy = jest.spyOn(global, 'fetch');

    afterEach(() => {
        process.env.NEXT_PUBLIC_ARAGAGON_BACKEND_URL = originalEnvUrl;
        serviceTest = new ServiceTest();
        fetchSpy.mockReset();
    });

    describe('request', () => {
        it('builds the full url and sends the request', async () => {
            const baseUrl = 'https://aragon.org';
            process.env.NEXT_PUBLIC_ARAGAGON_BACKEND_URL = baseUrl;
            serviceTest = new ServiceTest();
            const url = '/test';
            await serviceTest.request(url);
            expect(fetchSpy).toHaveBeenCalledWith(`${baseUrl}${url}`, expect.anything());
        });

        it('does not cache the request', async () => {
            fetchSpy.mockResolvedValue(generateResponse({ ok: true }));
            const url = '/entity';
            await serviceTest.request(url);
            expect(fetchSpy).toHaveBeenCalledWith(expect.anything(), { cache: 'no-store' });
        });

        it('throws AragonBackendService error on request error', async () => {
            const error = { code: 'notFound', description: 'error-description' };
            const status = 404;
            const response = generateResponse({ ok: false, status, json: () => Promise.resolve(error) });
            const expectedError = new AragonBackendServiceError(error.code, error.description, status);
            fetchSpy.mockResolvedValue(response);
            await expect(serviceTest.request('/test')).rejects.toEqual(expectedError);
        });

        it('returns the parsed json response', async () => {
            const parsedResult = { value: 'key' };
            const response = generateResponse({ json: () => Promise.resolve(parsedResult) });
            fetchSpy.mockResolvedValue(response);
            const result = await serviceTest.request('/url');
            expect(result).toEqual(parsedResult);
        });
    });

    describe('getNextPageParams', () => {
        it('returns undefined when there are no more items to fetch', () => {
            const previousPageMeta = generatePaginatedResponseMetadata({ page: 10, totalPages: 10 });
            const previousPage = generatePaginatedResponse({ metadata: previousPageMeta });
            const previousParams = { queryParams: {} };
            expect(serviceTest.getNextPageParamsQuery(previousPage, [previousPage], previousParams)).toBeUndefined();
        });

        it('returns the params to fetch the next page when having more items to fetch', () => {
            const previousPageMeta = generatePaginatedResponseMetadata({ page: 20, totalPages: 25 });
            const previousPage = generatePaginatedResponse({ metadata: previousPageMeta });
            const previousParams = { queryParams: { otherParams: 'value' }, urlParams: { id: 'test' } };
            expect(serviceTest.getNextPageParamsQuery(previousPage, [previousPage], previousParams)).toEqual({
                ...previousParams,
                queryParams: {
                    ...previousParams.queryParams,
                    page: 21,
                },
            });
        });
    });

    describe('buildUrl', () => {
        it('build the full url from the given base url', () => {
            const baseUrl = 'https://test.com';
            const url = '/api';
            const expectedUrl = `${baseUrl}${url}`;

            process.env.NEXT_PUBLIC_ARAGAGON_BACKEND_URL = baseUrl;
            serviceTest = new ServiceTest();
            expect(serviceTest['buildUrl'](url)).toEqual(expectedUrl);
        });

        it('correctly builds the full url from the given base url and url parameters', () => {
            const baseUrl = 'https://aragon.com';
            const url = '/proposals/:proposalId';
            const urlParams = { proposalId: 'id-test' };
            const expectedUrl = `${baseUrl}/proposals/${urlParams.proposalId}`;

            process.env.NEXT_PUBLIC_ARAGAGON_BACKEND_URL = baseUrl;
            serviceTest = new ServiceTest();
            expect(serviceTest['buildUrl'](url, { urlParams })).toEqual(expectedUrl);
        });

        it('builds the full url from the given base url, query parameters and url parameters', () => {
            const baseUrl = 'https://aragon.com';
            const url = '/dao/:daoId';
            const queryParams = { includeProposals: true, another: 'yes' };
            const urlParams = { daoId: 'test-dao' };
            const expectedUrl = `${baseUrl}/dao/${urlParams.daoId}?includeProposals=true&another=yes`;

            process.env.NEXT_PUBLIC_ARAGAGON_BACKEND_URL = baseUrl;
            serviceTest = new ServiceTest();
            expect(serviceTest['buildUrl'](url, { queryParams, urlParams })).toEqual(expectedUrl);
        });
    });

    describe('replaceUrlParams', () => {
        it('returns the current url on undefined params', () => {
            const url = '/test';
            expect(serviceTest['replaceUrlParams'](url, undefined)).toEqual(url);
        });

        it('correctly sets the url parameters on the given url', () => {
            const url = '/dao/:daoId/proposals/:proposalId';
            const params = { daoId: '1234', proposalId: 'abc' };
            const expectedUrl = `/dao/${params.daoId}/proposals/${params.proposalId}`;
            expect(serviceTest['replaceUrlParams'](url, params)).toEqual(expectedUrl);
        });
    });

    describe('parseQueryParams', () => {
        it('correctly parses boolean, string, number and null values', () => {
            const params = {
                bool: true,
                string: 'test',
                number: 5,
                null: null,
            };
            const expectedResult = new URLSearchParams({
                bool: `${params.bool}`,
                string: params.string,
                number: params.number.toString(),
                null: 'null',
            });
            expect(serviceTest['parseQueryParams'](params)).toEqual(expectedResult);
        });

        it('correctly parses object values', () => {
            const object = { key: 'value' };
            const params = { object };
            const expectedResult = new URLSearchParams({ object: JSON.stringify(object) });
            expect(serviceTest['parseQueryParams'](params)).toEqual(expectedResult);
        });

        it('skips undefined values', () => {
            const params = {
                undefined: undefined,
                test: 'test',
            };
            const expectedResult = new URLSearchParams({ test: params.test });
            expect(serviceTest['parseQueryParams'](params)).toEqual(expectedResult);
        });

        it('returns undefined when params are not defined', () => {
            expect(serviceTest['parseQueryParams'](undefined)).toBeUndefined();
        });

        it('returns undefined when params is an empty object', () => {
            expect(serviceTest['parseQueryParams']({})).toBeUndefined();
        });
    });
});
