import { type NextRequest, NextResponse } from 'next/server';

class BackendRequestUtils {
    private requestUrl = '/api/backend';

    request = async (request: NextRequest) => {
        const url = this.buildBackendUrl(request);
        const options = this.buildRequestOptions(request);

        const result = await fetch(url, options);
        const parsedResult = (await result.json()) as unknown;

        return NextResponse.json(parsedResult);
    };

    private buildBackendUrl = (request: NextRequest): string => {
        const { href, origin } = request.nextUrl;
        const relativeUrl = href.replace(`${origin}${this.requestUrl}`, '');
        const url = `${process.env.ARAGON_BACKEND_URL!}${relativeUrl}`;

        return url;
    };

    private buildRequestOptions = (request: NextRequest): RequestInit => {
        const { method, body, headers } = request;

        return { method, body, headers };
    };
}

export const backendRequestUtils = new BackendRequestUtils();
