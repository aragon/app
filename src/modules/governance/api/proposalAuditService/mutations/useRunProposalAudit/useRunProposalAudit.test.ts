import { act, renderHook, waitFor } from '@testing-library/react';
import { ReactQueryWrapper } from '@/shared/testUtils';
import type { IProposalAudit } from '../../../governanceService/domain';
import { proposalAuditService } from '../../proposalAuditService';
import { useRunProposalAudit } from './useRunProposalAudit';

describe('useRunProposalAudit mutation', () => {
    const runAuditSpy = jest.spyOn(proposalAuditService, 'runAudit');

    afterEach(() => {
        runAuditSpy.mockReset();
    });

    it('runs the proposal audit and returns the result', async () => {
        const audit: IProposalAudit = {
            riskLevel: 'low',
            summary: 'No issues found.',
            findings: [],
            recommendations: [],
            promptVersion: '2',
            tenderlyUrl: null,
            costUsd: null,
            durationMs: 100,
            createdAt: 1_700_000_000_000,
        };
        const params = { urlParams: { id: 'tx-plugin-42' } };
        runAuditSpy.mockResolvedValue(audit);

        const { result } = renderHook(() => useRunProposalAudit(), {
            wrapper: ReactQueryWrapper,
        });

        act(() => result.current.mutate(params));

        await waitFor(() => expect(result.current.data).toEqual(audit));
        expect(runAuditSpy).toHaveBeenCalledWith(params);
    });
});
