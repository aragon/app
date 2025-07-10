import { backendApiMocks } from '@/backendApiMocks';
import { deepmerge } from 'deepmerge-ts';

class FetchInterceptorUtils {
    private originalFetch = global.fetch.bind(global);

    intecept = () => {
        if (process.env.NEXT_PUBLIC_USE_MOCKS === 'true') {
            global.fetch = this.mockDataInterceptor;
        }
    };

    private mockDataInterceptor = async (...args: Parameters<typeof this.originalFetch>): Promise<Response> => {
        const [url, request] = args;

        const mock = backendApiMocks.find((mock) => mock.url.test(url as string));

        if (mock == null) {
            return this.originalFetch(...args);
        }

        let mockData = mock.data;

        if (mock.type === 'merge') {
            const result = await this.originalFetch(url, request);
            const resultJson = (await result.json()) as { _merged: boolean };
            mockData = resultJson._merged ? resultJson : deepmerge(resultJson, mock.data, { _merged: true });
        }

        return Promise.resolve({ ok: true, json: () => Promise.resolve(mockData) }) as unknown as Response;
    };
}

export const fetchInterceptorUtils = new FetchInterceptorUtils();
