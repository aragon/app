import type { IResource } from '../../../api/daoService';

export interface IResourcesInputProps {
    /**
     * The name of the field in the form.
     */
    name: string;
    /**
     * The name of the field in the form.
     */
    helpText: string;
    /**
     * The prefix of the field in the form.
     */
    fieldPrefix?: string;
    /**
     * Optional default value to init field with.
     */
    defaultValue?: IResource[];
    /**
     * Stacks the fields of each resource with a remove button, for narrow containers such as dialogs.
     * @default false
     */
    isStacked?: boolean;
}

export interface IResourcesInputResource {
    /**
     * Name of the resource.
     */
    name: string;
    /**
     * URL of the resource.
     */
    url: string;
}
