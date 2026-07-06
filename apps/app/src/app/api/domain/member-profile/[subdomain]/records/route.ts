import { type NextRequest, NextResponse } from 'next/server';
import { memberProfileServiceServer } from '@/modules/application/api/memberProfileService/memberProfileService.server';
import { monitoringUtils } from '@/shared/utils/monitoringUtils';

interface IRequestParams {
    /**
     * Aragon profile name, e.g. `test.aragon.eth`
     */
    subdomain: string;
}

interface IRequestOptions {
    /**
     * Parameters of the request call.
     */
    params: Promise<IRequestParams>;
}

export const GET = async (_req: NextRequest, { params }: IRequestOptions) => {
    const { subdomain } = await params;

    try {
        const result = await memberProfileServiceServer.getEnsTextRecords({
            urlParams: { subdomain },
        });

        return NextResponse.json(result);
    } catch (error) {
        monitoringUtils.logError(error, {
            context: { errorType: 'get_ens_text_records_error', subdomain },
        });

        return NextResponse.json(
            { error: 'getMemberProfileTextRecords request failed' },
            { status: 500 },
        );
    }
};
