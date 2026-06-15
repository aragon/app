import { useFlowDataContext } from '../providers/flowDataProvider';
import type { IFlowDaoData } from '../types';

export interface IUseFlowDataParams {
    /**
     * Kept for backwards compatibility with existing call sites. The provider
     * owns the current DAO identity, so these arguments are ignored by the
     * hook and only used as a documentation cue.
     */
    network: string;
    addressOrEns: string;
}

export interface IUseFlowDataResult {
    /** Live Flow snapshot — `null` while the indexer is still resolving the first query. */
    data: IFlowDaoData | null;
    /** `true` on the initial load. Does not re-flip during background refetches. */
    isLoading: boolean;
    /** `true` when the indexer query failed and no snapshot is available. */
    isError: boolean;
}

/**
 * Reads the current Flow data snapshot from the nearest {@link FlowDataProvider}.
 * Callers should render a skeleton while `isLoading` is true and an error
 * state when `isError` is true; the `data` field is only safe to read once
 * it becomes non-null.
 *
 * Components that need to trigger mutations (e.g. "Dispatch now") should
 * instead use {@link useFlowDataContext} directly.
 */
export const useFlowData = (
    _params: IUseFlowDataParams,
): IUseFlowDataResult => {
    const { data, isLoading, isError } = useFlowDataContext();
    return { data, isLoading, isError };
};
