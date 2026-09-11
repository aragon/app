import { generatePaginatedResponse } from '@/shared/testUtils';
import type { IWorkspaceQueryResponse } from '../../api/workspaceQueryService';

export const generateWorkspaceQueryResponse = <TData>(
    response?: Partial<IWorkspaceQueryResponse<TData>>,
): IWorkspaceQueryResponse<TData> => ({
    ...generatePaginatedResponse<TData>(),
    coverage: [],
    partial: false,
    ...response,
});
