import { type NextRequest, NextResponse } from 'next/server';

export class ProxyBackendUtils {
    private proxyUrl = '/api/backend';

    request = async (request: NextRequest) => {
        const url = this.buildBackendUrl(request);
        const requestOptions = await this.buildRequestOptions(request);

        const result = await fetch(url, requestOptions);
        const parsedResult = (await result.json()) as unknown;

        return NextResponse.json(parsedResult, {
            // pass original status and header data, or otherwise it will always return 200 OK
            status: result.status,
            statusText: result.statusText,
            headers: result.headers,
        });
    };

    private buildBackendUrl = (request: NextRequest): string => {
        const [, relativeUrl] = request.nextUrl.href.split(this.proxyUrl);
        const url = `${process.env.ARAGON_BACKEND_URL!}${relativeUrl}`;

        return url;
    };

    private buildRequestOptions = async (request: NextRequest): Promise<RequestInit> => {
        const { method, headers } = request;
        const body = method.toUpperCase() === 'POST' ? await request.text() : undefined;

        return { method, body, headers };
    };
}

export const proxyBackendUtils = new ProxyBackendUtils();
