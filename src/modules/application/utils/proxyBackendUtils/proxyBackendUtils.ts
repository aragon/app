import { type NextRequest, NextResponse } from 'next/server';
import { responseUtils } from '@/shared/utils/responseUtils';

export class ProxyBackendUtils {
    private readonly proxyUrl = '/api/backend';

    request = async (request: NextRequest) => {
        const url = this.buildBackendUrl(request);
        const requestOptions = await this.buildRequestOptions(request);

        const result = await fetch(url, requestOptions);

        // Forward no-content responses as-is without a body
        if (result.status === 204 || result.status === 205 || result.status === 304) {
            return new NextResponse(null, {
                status: result.status,
                headers: result.headers,
            });
        }

        const contentType = result.headers.get('content-type') ?? '';

        // JSON responses
        if (contentType.includes('application/json')) {
            const parsedResult = await responseUtils.safeJsonParseForResponse(result);
            if (parsedResult == null) {
                return new NextResponse(null, {
                    status: result.status,
                    headers: result.headers,
                });
            }
            return NextResponse.json(parsedResult, {
                status: result.status,
                headers: result.headers,
            });
        }

        // Non-JSON responses: stream back as text
        const bodyText = await result.text().catch(() => '');
        return new NextResponse(bodyText, {
            status: result.status,
            headers: result.headers,
        });
    };

    private readonly buildBackendUrl = (request: NextRequest): string => {
        const [, relativeUrl] = request.nextUrl.href.split(this.proxyUrl);
        const url = `${process.env.ARAGON_BACKEND_URL!}${relativeUrl}`;

        return url;
    };

    private readonly buildRequestOptions = async (request: NextRequest): Promise<RequestInit> => {
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
