import * as React from 'react';

/**
 * ResourcesInput — from @aragon/app@1.39.1 (apps/app/src/shared/components/forms/resourcesInput/resourcesInput.tsx).
 */
export interface ResourcesInputProps {
  /** The name of the field in the form. */
  name: string;
  /** The name of the field in the form. */
  helpText: string;
  /** The prefix of the field in the form. */
  fieldPrefix?: string;
  /** Optional default value to init field with. */
  defaultValue?: IResource[];
}

export interface IResource {
    /**
     * Name of the resource.
     */
    name: string;
    /**
     * Url of the resource.
     */
    url: string;
}

export declare const ResourcesInput: React.ComponentType<ResourcesInputProps>;
