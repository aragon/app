import 'server-only';
import { aragonSubdomainServiceBackend } from '@/shared/api/aragonSubdomainService/aragonSubdomainService.backend';
import type { IGetEnsTextRecordsParams } from './memberProfileService.api';

class MemberProfileServiceServer {
    getEnsTextRecords = async (params: IGetEnsTextRecordsParams) => {
        const result =
            await aragonSubdomainServiceBackend.getMemberProfileTextRecords({
                subdomain: params.urlParams.name,
            });

        if (!result.success) {
            throw new Error(
                'MemberProfileServiceServer: getEnsTextRecords failed',
                {
                    cause: result.error,
                },
            );
        }

        return result.result;
    };
}

export const memberProfileServiceServer = new MemberProfileServiceServer();
