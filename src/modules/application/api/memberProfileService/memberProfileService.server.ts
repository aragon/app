import 'server-only';
import { aragonDomainServiceBackend } from '@/shared/api/aragonDomainService/aragonDomainService.backend';
import type { IGetEnsTextRecordsParams } from './memberProfileService.api';

class MemberProfileServiceServer {
    getEnsTextRecords = async ({ urlParams }: IGetEnsTextRecordsParams) => {
        const result =
            await aragonDomainServiceBackend.getMemberProfileTextRecords(
                urlParams,
            );

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
