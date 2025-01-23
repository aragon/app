import { generateResponse } from '@/shared/testUtils';
import { HttpService } from './httpService';
import type { HttpServiceErrorHandler } from './httpService.api';

class ServiceTest extends HttpService {}

describe('Http service', () => {
    const fetchSpy = jest.spyOn(global, 'fetch');

    const generateHttpService = (url = '', errorHandler?: HttpServiceErrorHandler) =>
        new ServiceTest(url, errorHandler);

    let serviceTest = generateHttpService();

    afterEach(() => {
        serviceTest = generateHttpService();
        fetchSpy.mockReset();
    });

    describe('request', () => {
        it('builds the full url and sends the request', async () => {
            const baseUrl = 'https://aragon.org';
            serviceTest = generateHttpService(baseUrl);
            const url = '/test';
            await serviceTest.request(url);
            expect(fetchSpy).toHaveBeenCalledWith(`${baseUrl}${url}`, expect.anything());
        });

        it('forwards eventual request options to the fetch request', async () => {
            fetchSpy.mockResolvedValue(generateResponse({ ok: true }));
            const options = { keepalive: true };
            await serviceTest.request('/', undefined, options);
            expect(fetchSpy).toHaveBeenCalledWith(expect.anything(), expect.objectContaining(options));
        });

        it('does not cache the request', async () => {
            fetchSpy.mockResolvedValue(generateResponse({ ok: true }));
            const url = '/entity';
            await serviceTest.request(url);
            expect(fetchSpy).toHaveBeenCalledWith(expect.anything(), { cache: 'no-store' });
        });

        it('throws error from errorHandler property on request error', async () => {
            const error = { code: 'notFound', description: 'error-description' };
            const status = 404;
            const response = generateResponse({ ok: false, status, json: () => Promise.resolve(error) });
            const expectedError = new Error('custom error message');
            serviceTest = generateHttpService(undefined, () => Promise.resolve(expectedError));
            fetchSpy.mockResolvedValue(response);
            await expect(serviceTest.request('/test')).rejects.toEqual(expectedError);
        });

        it('throws default erorr when errorHandler is not defined', async () => {
            const response = generateResponse({ ok: false, statusText: 'status-text' });
            const expectedError = new Error(response.statusText);
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

    describe('buildUrl', () => {
        it('build the full url from the given base url', () => {
            const baseUrl = 'https://test.com';
            const url = '/api';
            const expectedUrl = `${baseUrl}${url}`;
            serviceTest = generateHttpService(baseUrl);
            expect(serviceTest['buildUrl'](url)).toEqual(expectedUrl);
        });

        it('correctly builds the full url from the given base url and url parameters', () => {
            const baseUrl = 'https://aragon.com';
            const url = '/proposals/:proposalId';
            const urlParams = { proposalId: 'id-test' };
            const expectedUrl = `${baseUrl}/proposals/${urlParams.proposalId}`;
            serviceTest = generateHttpService(baseUrl);
            expect(serviceTest['buildUrl'](url, { urlParams })).toEqual(expectedUrl);
        });

        it('builds the full url from the given base url, query parameters and url parameters', () => {
            const baseUrl = 'https://aragon.com';
            const url = '/dao/:daoId';
            const queryParams = { includeProposals: true, another: 'yes' };
            const urlParams = { daoId: 'test-dao' };
            const expectedUrl = `${baseUrl}/dao/${urlParams.daoId}?includeProposals=true&another=yes`;
            serviceTest = generateHttpService(baseUrl);
            expect(serviceTest['buildUrl'](url, { queryParams, urlParams })).toEqual(expectedUrl);
        });
    });

    describe('buildOptions', () => {
        it('appends content-type header when request type is POST and body is not FormData', () => {
            const options = { method: 'POST', headers: { key: 'value' } };
            const body = { key: 'value' };
            const processedOptions = generateHttpService()['buildOptions'](options, body);
            expect(processedOptions.headers).toEqual({ 'Content-type': 'application/json', ...options.headers });
        });

        it('does not append content-type header when request type is POST and body is FormData', () => {
            const options = { method: 'POST' };
            const body = new FormData();
            const processedOptions = generateHttpService()['buildOptions'](options, body);
            expect(processedOptions.headers).toBeUndefined();
        });

        it('returns default options when parameter is not defined', () => {
            const processedOptions = generateHttpService()['buildOptions']({});
            expect(processedOptions.headers).toBeUndefined();
            expect(processedOptions.method).toBeUndefined();
        });
    });

    describe('parseBody', () => {
        it('returns undefined when body is not defined', () => {
            expect(generateHttpService()['parseBody']()).toBeUndefined();
        });

        it('returns the body as string when body is not FormData', () => {
            const body = { key: 'value' };
            expect(generateHttpService()['parseBody'](body)).toEqual(JSON.stringify(body));
        });

        it('does not process the body when body is FormData', () => {
            const body = new FormData();
            body.append('name', 'value');
            expect(generateHttpService()['parseBody'](body)).toEqual(body);
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
                bool: params.bool.toString(),
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
