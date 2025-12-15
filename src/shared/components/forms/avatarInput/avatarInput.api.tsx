import type { IInputFileAvatarValue } from '@aragon/gov-ui-kit';

export interface IAvatarInputProps {
    /**
     * The name of the field in the form.
     */
    name: string;
    /**
     * Help text to display below the input.
     */
    helpText?: string;
    /**
     * The prefix of the field in the form.
     */
    fieldPrefix?: string;
    /**
     * Maximum file size in bytes.
     * @default 1048576 (1 MB)
     */
    maxFileSize?: number;
    /**
     * Maximum dimension (width/height) in pixels.
     * @default 1024
     */
    maxDimension?: number;
    /**
     * Whether the field is optional.
     * @default true
     */
    isOptional?: boolean;
    /**
     * Optional default value to init field with.
     */
    defaultValue?: IInputFileAvatarValue;
}
