import type { IProposalActionsArrayControls } from '@aragon/gov-ui-kit';
import { useCallback } from 'react';
import { useFieldArray, useFormContext, useWatch } from 'react-hook-form';
import { useTranslations } from '@/shared/components/translationsProvider';
import { plausibleAnalyticsUtils } from '@/shared/utils/plausibleAnalyticsUtils';
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
const resolveActionCategory = (action: IProposalActionData) => {
    const actionType = action.type.toLowerCase();

    if (actionType.includes('withdraw')) {
        return 'native_withdraw';
    }

    if (actionType.includes('uninstall')) {
        return 'native_uninstall_plugin';
    }

    if (actionType.includes('install')) {
        return 'native_install_plugin';
    }

    if (actionType.includes('metadata')) {
        return 'native_metadata_update';
    }

    if (actionType.includes('external')) {
        return 'external_contract_call';
    }

    return 'unknown_native';
};

/**
 * Merges a field-array entry with its watched form value.
 *
 * `useFieldArray`'s `fields` update synchronously inside `remove()`/`append()`, but `useWatch` only
 * catches up a render later, through react-hook-form's own internal broadcast. Comparing array
 * length alone is not enough to detect that lag: deleting one action and adding a different one
 * leaves the array length unchanged, so a `watchedAction` that still describes the just-deleted
 * action can slip through - overwriting not just stale field values but the new action's `type`,
 * which silently mounts the wrong view populated with the previous action's data. Comparing
 * `fieldId` (unique per action instance) catches the lag even when the length coincidentally
 * matches again.
 */
export const mergeWatchedAction = (
    field: IProposalActionData,
    watchedAction: IProposalActionData | undefined,
): IProposalActionData => {
    const fieldId = field.fieldId ?? field.id;
    const isWatchedActionCurrent = watchedAction?.fieldId === fieldId;

    return {
        ...field,
        ...(isWatchedActionCurrent ? watchedAction : undefined),
        fieldId,
    };
};

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
    const actionsMerged = actions.map((field, index) =>
        mergeWatchedAction(field, watchActions?.[index]),
    );

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
        // Assign a stable `fieldId` used as the React key of the rendered action item. Without it
        // the key would fall back to RHF's field array id, which is regenerated whenever the decoder
        // writes re-encoded calldata to `actions.N.data`, remounting the item and dropping focus.
        const actionsWithId = newActions.map((action) => ({
            ...action,
            fieldId: action.fieldId ?? crypto.randomUUID(),
        }));
        const actionCategories = new Set(newActions.map(resolveActionCategory));
        const actionCategory =
            actionCategories.size === 1 ? [...actionCategories][0] : 'mixed';
        plausibleAnalyticsUtils.track(
            newActions.length === 1 ? 'action_added' : 'action_added_batch',
            {
                source: 'form',
                actionCategory,
                count: newActions.length === 1 ? undefined : newActions.length,
            },
        );
        append(actionsWithId);
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
