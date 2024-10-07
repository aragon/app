import { useFieldArray, type UseFieldArrayReturn } from 'react-hook-form';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type StageInputItemBaseForm = Record<string, any>;

interface UseStagesReturn {
    stagesFieldArray: StageInputItemBaseForm[];
    appendStage: UseFieldArrayReturn<StageInputItemBaseForm>['append'];
    removeStage: UseFieldArrayReturn<StageInputItemBaseForm>['remove'];
    updateStage: UseFieldArrayReturn<StageInputItemBaseForm>['update'];
}

export const useStagesFieldArray = (stageName: string): UseStagesReturn => {
    const stageFieldArrayName = `${stageName}`;

    const { fields, append, remove, update } = useFieldArray<StageInputItemBaseForm>({
        name: stageFieldArrayName,
    });

    return {
        stagesFieldArray: fields,
        appendStage: append,
        removeStage: remove,
        updateStage: update,
    };
};
