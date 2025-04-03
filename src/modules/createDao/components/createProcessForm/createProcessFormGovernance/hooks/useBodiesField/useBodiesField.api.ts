import { type FieldArrayWithId } from 'react-hook-form';
import type { ICreateProcessFormData } from '../../../createProcessFormDefinitions';

export interface IUseBodiesFieldParams {
    /**
     * Defines if the bodies are being setup for an advanced governance process.
     */
    isAdvancedGovernance?: boolean;
    /**
     * ID of the dao used for plugin-setup settings.
     */
    daoId: string;
}

export interface IUseBodiesFieldReturn {
    /**
     * Callback to add a body to the governance process.
     */
    addBody: (stageId?: string) => void;
    /**
     * Callback to remove a body from the governance process.
     */
    removeBody: (bodyId: string) => void;
    /**
     * Callback to open the body-wizard dialog to edit an existing body.
     */
    editBody: (bodyId: string) => void;
    /**
     * List of bodies for the current governance process.
     */
    bodies: Array<FieldArrayWithId<ICreateProcessFormData, 'bodies'>>;
}
