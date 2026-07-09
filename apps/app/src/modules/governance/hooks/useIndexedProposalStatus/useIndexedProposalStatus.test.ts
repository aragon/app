import { ProposalStatus } from '@aragon/gov-ui-kit';
import { renderHook } from '@testing-library/react';
import * as useSlotSingleFunction from '@/shared/hooks/useSlotSingleFunction';
import {
    generateReactQueryResultLoading,
    generateReactQueryResultSuccess,
} from '@/shared/testUtils';
import * as governanceService from '../../api/governanceService';
import { GovernanceSlotId } from '../../constants/moduleSlots';
import { generateProposal } from '../../testUtils';
import { useIndexedProposalStatus } from './useIndexedProposalStatus';

describe('useIndexedProposalStatus hook', () => {
    const useProposalBySlugSpy = jest.spyOn(
        governanceService,
        'useProposalBySlug',
    );
    const useSlotSingleFunctionSpy = jest.spyOn(
        useSlotSingleFunction,
        'useSlotSingleFunction',
    );

    beforeEach(() => {
        useProposalBySlugSpy.mockReturnValue(
            generateReactQueryResultLoading() as ReturnType<
                typeof governanceService.useProposalBySlug
            >,
        );
        useSlotSingleFunctionSpy.mockReturnValue(undefined);
    });

    afterEach(() => {
        useProposalBySlugSpy.mockReset();
        useSlotSingleFunctionSpy.mockReset();
    });

    it('keeps the fallback status before indexing', () => {
        const { result } = renderHook(() =>
            useIndexedProposalStatus({
                daoId: 'dao-id',
                fallbackStatus: ProposalStatus.EXECUTABLE,
                isIndexed: false,
                slug: 'CORE-1',
            }),
        );

        expect(result.current).toEqual(ProposalStatus.EXECUTABLE);
        expect(useProposalBySlugSpy).toHaveBeenCalledWith(
            expect.any(Object),
            expect.objectContaining({ enabled: false }),
        );
    });

    it('ignores cached proposal data until a fresh post-index fetch completes', () => {
        const cachedProposal = generateProposal({ id: 'cached-proposal' });
        const freshProposal = generateProposal({ id: 'fresh-proposal' });
        let proposalQueryResult = generateReactQueryResultSuccess({
            data: cachedProposal,
            isFetchedAfterMount: false,
        }) as ReturnType<typeof governanceService.useProposalBySlug>;

        useProposalBySlugSpy.mockImplementation(() => proposalQueryResult);
        useSlotSingleFunctionSpy.mockImplementation(({ params }) =>
            params === freshProposal
                ? ProposalStatus.EXECUTED
                : ProposalStatus.ACTIVE,
        );

        const { result, rerender } = renderHook(() =>
            useIndexedProposalStatus({
                daoId: 'dao-id',
                fallbackStatus: ProposalStatus.EXECUTABLE,
                isIndexed: true,
                slug: 'CORE-1',
            }),
        );

        expect(result.current).toEqual(ProposalStatus.EXECUTABLE);
        expect(useProposalBySlugSpy).toHaveBeenCalledWith(
            {
                urlParams: { slug: 'CORE-1' },
                queryParams: { daoId: 'dao-id' },
            },
            expect.objectContaining({
                enabled: true,
                refetchOnMount: 'always',
                staleTime: 0,
            }),
        );
        expect(useSlotSingleFunctionSpy).not.toHaveBeenCalledWith(
            expect.objectContaining({ params: cachedProposal }),
        );

        proposalQueryResult = generateReactQueryResultSuccess({
            data: freshProposal,
            isFetchedAfterMount: true,
        }) as ReturnType<typeof governanceService.useProposalBySlug>;

        rerender();

        expect(result.current).toEqual(ProposalStatus.EXECUTED);
        expect(useSlotSingleFunctionSpy).toHaveBeenCalledWith(
            expect.objectContaining({
                params: freshProposal,
                pluginId: freshProposal.pluginInterfaceType,
                slotId: GovernanceSlotId.GOVERNANCE_PROCESS_PROPOSAL_STATUS,
            }),
        );
    });
});
