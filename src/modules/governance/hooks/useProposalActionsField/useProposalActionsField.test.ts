import { act, renderHook } from '@testing-library/react';
import { FormWrapper } from '@/shared/testUtils';
import type { IProposalActionData } from '../../components/createProposalForm';
import { useProposalActionsField } from './useProposalActionsField';

describe('useProposalActionsField hook', () => {
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
