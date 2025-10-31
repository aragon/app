import { backendApiMocks } from '@/backendApiMocks';
import { responseUtils } from '@/shared/utils/responseUtils';
import { deepmerge } from 'deepmerge-ts';

class FetchInterceptorUtils {
    private originalFetch = global.fetch.bind(global);

    intercept = () => {
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

            const parsedResult = await responseUtils.safeJsonParse(result);
            const resultJson =
                parsedResult && typeof parsedResult === 'object' && !Array.isArray(parsedResult)
                    ? (parsedResult as { _merged?: boolean })
                    : {};
            mockData = resultJson._merged ? resultJson : deepmerge(resultJson, mock.data, { _merged: true });
        }

        return new Response(JSON.stringify(mockData), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });
    };
}

export const fetchInterceptorUtils = new FetchInterceptorUtils();
