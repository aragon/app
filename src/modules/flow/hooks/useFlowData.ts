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

/**
 * Reads the current Flow data snapshot from the nearest {@link FlowDataProvider}.
 * Components that need to trigger mutations (e.g. "Dispatch now") should
 * instead use {@link useFlowDataContext} directly.
 */
export const useFlowData = (_params: IUseFlowDataParams): IFlowDaoData => {
    return useFlowDataContext().data;
};
