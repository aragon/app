import { type NextRequest, NextResponse } from 'next/server';

export class ProxyBackendUtils {
    private proxyUrl = '/api/backend';

    request = async (request: NextRequest) => {
        const url = this.buildBackendUrl(request);

        // Add Authorization header if API key is available
        const headers = new Headers(request.headers);
        if (process.env.ARAGON_BACKEND_API_KEY) {
            headers.set('Authorization', `Bearer ${process.env.ARAGON_BACKEND_API_KEY}`);
        }

        const result = await fetch(url, {
            method: request.method,
            headers,
            body: request.body,
        });
        const parsedResult = (await result.json()) as unknown;

        return NextResponse.json(parsedResult);
    };

    private buildBackendUrl = (request: NextRequest): string => {
        const [, relativeUrl] = request.nextUrl.href.split(this.proxyUrl);
        const url = `${process.env.ARAGON_BACKEND_URL!}${relativeUrl}`;

        return url;
    };
}

export const proxyBackendUtils = new ProxyBackendUtils();
