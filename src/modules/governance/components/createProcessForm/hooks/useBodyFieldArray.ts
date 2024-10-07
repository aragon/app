import { ICreateProcessFormBodyData } from '@/modules/governance/components/createProcessForm/createProcessFormDefinitions';
import { useFieldArray, useFormContext, type UseFieldArrayReturn } from 'react-hook-form';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type BodyInputItemBaseForm = Record<string, any>;

interface UseBodiesReturn {
    bodiesFieldArray: BodyInputItemBaseForm[];
    appendBody: UseFieldArrayReturn<BodyInputItemBaseForm>['append'];
    removeBody: UseFieldArrayReturn<BodyInputItemBaseForm>['remove'];
    updateBody: UseFieldArrayReturn<BodyInputItemBaseForm>['update'];
}

export const useBodiesFieldArray = (stageName: string, stageIndex: number): UseBodiesReturn => {
    const bodyFieldArrayName = `${stageName}.${stageIndex}.bodies`;
    const { watch } = useFormContext();

    const { fields, append, remove, update } = useFieldArray({
        name: bodyFieldArrayName,
    });

    const watchBodiesFieldArray = watch(bodyFieldArrayName);

    const controlledFields = watchBodiesFieldArray.map((field: ICreateProcessFormBodyData, index: number) => {
        return {
            ...field,
            ...watchBodiesFieldArray[index],
        };
    });

    return {
        bodiesFieldArray: controlledFields,
        appendBody: append,
        removeBody: remove,
        updateBody: update,
    };
};
