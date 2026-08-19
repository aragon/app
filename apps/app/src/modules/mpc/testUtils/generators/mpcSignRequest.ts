import type { IMpcSignRequest } from '@/modules/mpc/api/mpcService/domain';

export const generateMpcSignRequest = (
    request?: Partial<IMpcSignRequest>,
): IMpcSignRequest => ({
    id: 'request-1',
    systemId: 'system-1',
    type: 'message',
    payload: { type: 'message', message: { message: 'hello' } },
    summary: { label: 'Sign message "hello"' },
    status: 'approved',
    policyDecision: { allowed: true, requiresApproval: false, reasons: [] },
    approvals: [],
    rejections: [],
    approvalsRequired: 0,
    createdBy: 'alice',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    ...request,
});
