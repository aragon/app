import { type StageInputItemBaseForm } from '@/modules/governance/components/createProcessForm/createProcessFormDefinitions';

export interface IStageInputResource {
    /**
     * Name of the resource.
     */
    name: string;
    /**
     * URL of the resource.
     */
    url: string;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type StageBaseFormFields = Record<string, any>;

export interface ICreateProcessFormStageFieldsProps {
    /**
     * Array field of stage fields.
     */
    stagesFieldArray: StageInputItemBaseForm[];
    /**
     * Name of the field.
     */
    stageName: string;
    /**
     * The index of the stage in the list.
     */
    stageIndex: number;
    /**
     * Callback to remove the proposed stage.
     */
    stageRemove: (index: number) => void;
}
