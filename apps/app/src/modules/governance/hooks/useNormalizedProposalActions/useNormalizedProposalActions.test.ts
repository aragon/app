import { renderHook } from '@testing-library/react';
import { generateProposalAction } from '@/modules/governance/testUtils';
import { pluginRegistryUtils } from '@/shared/utils/pluginRegistryUtils';
import { GovernanceSlotId } from '../../constants/moduleSlots';
import { useNormalizedProposalActions } from './useNormalizedProposalActions';

describe('useNormalizedProposalActions hook', () => {
    const getSlotFunctionsSpy = jest.spyOn(
        pluginRegistryUtils,
        'getSlotFunctions',
    );

    afterEach(() => {
        getSlotFunctionsSpy.mockReset();
    });

    it('retrieves and triggers all plugin-specific normalization functions to normalize the proposal actions', () => {
        const daoId = 'test';
        const actions = [generateProposalAction()];
        const normalizationFunctionOne = jest.fn(() => actions);
        const normalizationFunctionTwo = jest.fn(() => actions);
        getSlotFunctionsSpy.mockReturnValue([
            normalizationFunctionOne,
            normalizationFunctionTwo,
        ]);

        renderHook(() => useNormalizedProposalActions({ actions, daoId }));

        expect(getSlotFunctionsSpy).toHaveBeenCalledWith(
            GovernanceSlotId.GOVERNANCE_PLUGIN_NORMALIZE_ACTIONS,
        );
        const expectedParams = { actions, daoId };
        expect(normalizationFunctionOne).toHaveBeenCalledWith(expectedParams);
        expect(normalizationFunctionTwo).toHaveBeenCalledWith(expectedParams);
    });

    it('chains the normalization functions and returns the result of the last one', () => {
        const firstResult = [generateProposalAction({ type: '1' })];
        const secondResult = [generateProposalAction({ type: '2' })];
        const normalizationFunctionOne = jest.fn(() => firstResult);
        const normalizationFunctionTwo = jest.fn(() => secondResult);
        getSlotFunctionsSpy.mockReturnValue([
            normalizationFunctionOne,
            normalizationFunctionTwo,
        ]);

        const { result } = renderHook(() =>
            useNormalizedProposalActions({ actions: [], daoId: 'dao-id' }),
        );

        expect(normalizationFunctionTwo).toHaveBeenCalledWith({
            actions: firstResult,
            daoId: 'dao-id',
        });
        expect(result.current).toEqual(secondResult);
    });

    it('returns the actions as they are when no normalization function is registered', () => {
        const actions = [generateProposalAction()];
        getSlotFunctionsSpy.mockReturnValue([]);

        const { result } = renderHook(() =>
            useNormalizedProposalActions({ actions, daoId: 'dao-id' }),
        );

        expect(result.current).toEqual(actions);
    });
});
