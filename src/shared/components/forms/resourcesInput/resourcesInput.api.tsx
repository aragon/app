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
