import type { IDelegateStatement } from '@/modules/governance/components/delegationStatementCard/delegateStatement.api';
import { apiVersionUtils } from '@/shared/utils/apiVersionUtils';
import { AragonBackendService } from '../aragonBackendService';
import type { IGetDelegateStatementParams } from './delegateStatementService.api';

class DelegateStatementService extends AragonBackendService {
    private basePaths = {
        delegateStatement: '/ipfs/delegate-statement/:cid',
    };

    private get urls() {
        return {
            delegateStatement: apiVersionUtils.buildVersionedUrl(
                this.basePaths.delegateStatement,
                { forceVersion: 'v2' },
            ),
        };
    }

    getDelegateStatement = async (
        params: IGetDelegateStatementParams,
    ): Promise<IDelegateStatement> =>
        this.request<IDelegateStatement>(this.urls.delegateStatement, params);
}

export const delegateStatementService = new DelegateStatementService();
