import { type NextRequest, NextResponse } from 'next/server';

export class ProxyBackendUtils {
    private proxyUrl = '/api/backend';

    request = async (request: NextRequest) => {
        const url = this.buildBackendUrl(request);

        const result = await fetch(url, request);
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
