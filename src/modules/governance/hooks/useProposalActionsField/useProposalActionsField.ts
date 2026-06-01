import type { IProposalActionsArrayControls } from '@aragon/gov-ui-kit';
import { useCallback } from 'react';
import { useFieldArray, useFormContext, useWatch } from 'react-hook-form';
import { useTranslations } from '@/shared/components/translationsProvider';
import type {
    ICreateProposalFormData,
    IProposalActionData,
} from '../../components/createProposalForm';

/**
 * Manages the shared `actions` field array used by the proposal and
 * direct-execute action editors: field-array setup, the watch/merge guard that
 * keeps rendered data in sync with view edits, and the add/remove/reorder
 * handlers. Must be called within a form context holding an `actions` array.
 */
export const useProposalActionsField = () => {
    const { t } = useTranslations();

    const { control, getValues, setValue } =
        useFormContext<ICreateProposalFormData>();

    const {
        fields: actions,
        append,
        remove,
    } = useFieldArray({ control, name: 'actions' });

    // We need to watch because action views can update data, and it's not reflected otherwise!
    // We merge it with `actions` because of `id` and other internal props which are missing in watched action.
    const watchActions = useWatch<
        Record<string, ICreateProposalFormData['actions']>
    >({ name: 'actions' });
    // Skip stale watch data when lengths diverge after remove() to avoid index corruption.
    const stableWatchActions =
        watchActions?.length === actions.length ? watchActions : undefined;
    const actionsMerged = actions.map((field, index) => ({
        ...field,
        ...stableWatchActions?.[index],
        id: field.id,
    }));

    /**
     * Note: We don't use useFieldArray.swap() or .move() because they create empty slots
     * when dealing with complex nested objects, causing data loss and crashes. Instead,
     * we use structuredClone to create a deep copy, manually swap elements, and update
     * the entire array at once.
     */
    const handleMoveAction = useCallback(
        (index: number, newIndex: number) => {
            if (newIndex < 0 || newIndex >= actions.length) {
                return;
            }

            const currentActions = getValues('actions');
            const actionsCopy = structuredClone(currentActions);

            const temp = actionsCopy[index];
            actionsCopy[index] = actionsCopy[newIndex];
            actionsCopy[newIndex] = temp;

            setValue('actions', actionsCopy, {
                shouldValidate: false,
                shouldDirty: true,
                shouldTouch: false,
            });
        },
        [actions, getValues, setValue],
    );

    const handleRemoveAction = (index: number) => {
        remove(index);
    };

    const handleAddAction = (newActions: IProposalActionData[]) => {
        append(newActions);
    };

    const handleRemoveAllActions = useCallback(() => {
        remove();
    }, [remove]);

    const getArrayControls = (
        index: number,
    ): IProposalActionsArrayControls<IProposalActionData> => ({
        moveUp: {
            label: t('app.governance.createProposalForm.actions.editAction.up'),
            onClick: (index) => handleMoveAction(index, index - 1),
            disabled: actions.length < 2 || index === 0,
        },
        moveDown: {
            label: t(
                'app.governance.createProposalForm.actions.editAction.down',
            ),
            onClick: (index) => handleMoveAction(index, index + 1),
            disabled: actions.length < 2 || index === actions.length - 1,
        },
        remove: {
            label: t(
                'app.governance.createProposalForm.actions.editAction.remove',
            ),
            onClick: handleRemoveAction,
            disabled: false,
        },
    });

    return {
        /**
         * Field entries merged with their watched form values, ready for
         * rendering. Use its `length` for emptiness checks.
         */
        actionsMerged,
        /**
         * Appends new actions to the array.
         */
        handleAddAction,
        /**
         * Removes all actions from the array.
         */
        handleRemoveAllActions,
        /**
         * Builds the move/remove controls for the action at the given index.
         */
        getArrayControls,
    };
};
