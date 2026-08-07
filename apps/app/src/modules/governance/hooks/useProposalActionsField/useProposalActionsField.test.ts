import { act, renderHook } from '@testing-library/react';
import { FormWrapper } from '@/shared/testUtils';
import { plausibleAnalyticsUtils } from '@/shared/utils/plausibleAnalyticsUtils';
import type { IProposalActionData } from '../../components/createProposalForm';
import {
    mergeWatchedAction,
    useProposalActionsField,
} from './useProposalActionsField';

describe('mergeWatchedAction', () => {
    const generateAction = (
        action?: Partial<IProposalActionData>,
    ): IProposalActionData =>
        ({
            type: 'transfer',
            daoId: 'test',
            meta: undefined,
            ...action,
        }) as IProposalActionData;

    it('merges the watched values when they belong to the same action', () => {
        const field = generateAction({
            type: 'transfer',
            fieldId: 'action-1',
            id: 'rhf-1',
        });
        const watchedAction = generateAction({
            type: 'transfer',
            fieldId: 'action-1',
            amount: '100',
        } as Partial<IProposalActionData>);

        expect(mergeWatchedAction(field, watchedAction)).toEqual({
            ...field,
            ...watchedAction,
            fieldId: 'action-1',
        });
    });

    it('ignores a watched action left over from a deleted action at the same index', () => {
        // Reproduces deleting an action and adding a different one: `useFieldArray`'s `fields`
        // already reflect the new action, but `useWatch` can still be one render behind and hand
        // back data describing the action that used to sit at this index.
        const field = generateAction({
            type: 'gaugeRegistrarRegisterGauge',
            fieldId: 'action-2',
            id: 'rhf-2',
        });
        const staleWatchedAction = generateAction({
            type: 'transfer',
            fieldId: 'action-1',
            amount: '100',
        } as Partial<IProposalActionData>);

        const result = mergeWatchedAction(field, staleWatchedAction);

        expect(result.type).toEqual('gaugeRegistrarRegisterGauge');
        expect(result).not.toHaveProperty('amount');
        expect(result.fieldId).toEqual('action-2');
    });

    it('falls back to the field id when neither the field nor the watched action carry a fieldId', () => {
        const field = generateAction({ fieldId: undefined, id: 'rhf-3' });

        expect(mergeWatchedAction(field, undefined).fieldId).toEqual('rhf-3');
    });

    it('does not merge when there is no watched action yet at this index', () => {
        const field = generateAction({ fieldId: 'action-4', id: 'rhf-4' });

        expect(mergeWatchedAction(field, undefined)).toEqual({
            ...field,
            fieldId: 'action-4',
        });
    });
});

describe('useProposalActionsField hook', () => {
    const trackAnalyticsSpy = jest.spyOn(plausibleAnalyticsUtils, 'track');

    beforeEach(() => {
        trackAnalyticsSpy.mockImplementation(() => undefined);
    });

    afterEach(() => {
        trackAnalyticsSpy.mockReset();
    });

    const generateAction = (
        action?: Partial<IProposalActionData>,
    ): IProposalActionData =>
        ({
            type: 'transfer',
            daoId: 'test',
            meta: undefined,
            ...action,
        }) as IProposalActionData;

    it('starts with an empty action list', () => {
        const { result } = renderHook(() => useProposalActionsField(), {
            wrapper: FormWrapper,
        });

        expect(result.current.actionsMerged).toHaveLength(0);
    });

    it('appends actions and exposes them through actionsMerged', () => {
        const { result } = renderHook(() => useProposalActionsField(), {
            wrapper: FormWrapper,
        });

        act(() => {
            result.current.handleAddAction([
                generateAction(),
                generateAction(),
            ]);
        });

        expect(result.current.actionsMerged).toHaveLength(2);
        expect(trackAnalyticsSpy).toHaveBeenCalledWith('action_added_batch', {
            source: 'form',
            count: 2,
            actionCategory: 'unknown_native',
        });
    });

    it('tracks a single native withdrawal action', () => {
        const { result } = renderHook(() => useProposalActionsField(), {
            wrapper: FormWrapper,
        });

        act(() => {
            result.current.handleAddAction([
                generateAction({ type: 'withdraw' }),
            ]);
        });

        expect(trackAnalyticsSpy).toHaveBeenCalledWith('action_added', {
            source: 'form',
            actionCategory: 'native_withdraw',
        });
    });
    it('removes all actions', () => {
        const { result } = renderHook(() => useProposalActionsField(), {
            wrapper: FormWrapper,
        });

        act(() => {
            result.current.handleAddAction([generateAction()]);
        });
        expect(result.current.actionsMerged).toHaveLength(1);

        act(() => {
            result.current.handleRemoveAllActions();
        });
        expect(result.current.actionsMerged).toHaveLength(0);
    });

    it('disables moveUp on the first action and moveDown on the last action', () => {
        const { result } = renderHook(() => useProposalActionsField(), {
            wrapper: FormWrapper,
        });

        act(() => {
            result.current.handleAddAction([
                generateAction(),
                generateAction(),
            ]);
        });

        const first = result.current.getArrayControls(0);
        const last = result.current.getArrayControls(1);

        expect(first.moveUp?.disabled).toBe(true);
        expect(first.moveDown?.disabled).toBe(false);
        expect(last.moveUp?.disabled).toBe(false);
        expect(last.moveDown?.disabled).toBe(true);
        expect(first.remove?.disabled).toBe(false);
    });

    it('disables both move controls when there is a single action', () => {
        const { result } = renderHook(() => useProposalActionsField(), {
            wrapper: FormWrapper,
        });

        act(() => {
            result.current.handleAddAction([generateAction()]);
        });

        const controls = result.current.getArrayControls(0);

        expect(controls.moveUp?.disabled).toBe(true);
        expect(controls.moveDown?.disabled).toBe(true);
    });
});
