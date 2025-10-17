import { type NextRequest, NextResponse } from 'next/server';

export class ProxyBackendUtils {
    private proxyUrl = '/api/backend';

    request = async (request: NextRequest) => {
        const url = this.buildBackendUrl(request);
        const requestOptions = await this.buildRequestOptions(request);

        const result = await fetch(url, requestOptions);
        const parsedResult = (await result.json()) as unknown;

        return NextResponse.json(parsedResult, result);
    };

    private buildBackendUrl = (request: NextRequest): string => {
        const [, relativeUrl] = request.nextUrl.href.split(this.proxyUrl);
        const url = `${process.env.ARAGON_BACKEND_URL!}${relativeUrl}`;

        return url;
    };

    private buildRequestOptions = async (request: NextRequest): Promise<RequestInit> => {
        const { method, headers } = request;
        const body = method.toUpperCase() === 'POST' ? await request.text() : undefined;

        const processedHeaders = new Headers(headers);

        if (process.env.NEXT_SECRET_ARAGON_BACKEND_API_KEY) {
            processedHeaders.set('X-API-Key', process.env.NEXT_SECRET_ARAGON_BACKEND_API_KEY);
        }

        return { method, body, headers: processedHeaders };
    };
}

export const proxyBackendUtils = new ProxyBackendUtils();
