/* eslint-disable @typescript-eslint/no-explicit-any */
import type { IOpenDialogState } from '@/modules/governance/components/createProcessForm/createProcessFormDefinitions';

export interface ICreateProcessFormBodySummaryProps {
    /**
     * The body fields.
     */
    bodyFieldsArray: any[];
    /**
     * Callback to set the body dialog open.
     */
    setIsBodyDialogOpen: (value: IOpenDialogState) => void;
    /**
     * Callback to remove a body.
     */
    removeBody: (index: number) => void;
    /**
     * Callback to handle editing a body.
     */
    onEditBody: (index: number) => void;
    /**
     * Stage name.
     */
    stageName: string;
    /**
     * Stage index.
     */
    stageIndex: number;
}
