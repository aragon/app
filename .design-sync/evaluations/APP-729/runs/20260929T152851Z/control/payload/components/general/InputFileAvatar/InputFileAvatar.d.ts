import * as React from 'react';

/**
 * InputFileAvatar — from @aragon/gov-ui-kit@2.10.0.
 */
export interface InputFileAvatarProps {
  /** Function that is called when a file is selected. If the file is rejected, the function is not called. If the file is acc */
  onChange: (value?: IInputFileAvatarValue) => void;
  /** The current value of the input. */
  value?: IInputFileAvatarValue;
  /** Allowed file extensions, it must be an object with the keys set to the MIME type and the values an array of file extensi */
  acceptedFileTypes?: Accept;
  /** Maximum file size in bytes (e.g. 2097152 bytes | 2 * 1024 ** 2 = 2MiB). */
  maxFileSize?: number;
  /** Minimum dimension of the image in pixels. */
  minDimension?: number;
  /** Maximum dimension of the image in pixels. */
  maxDimension?: number;
  /** If true, only square images are accepted. */
  onlySquare?: boolean;
  /** Optional ID for the file avatar input. */
  id?: string;
  /** Label of the input. */
  label?: React.ReactNode;
  /** Displays the input as disabled when set to true. */
  disabled?: boolean;
  /** Variant of the input. */
  variant?: "default" | "warning" | "critical";
  /** Help text displayed above the input. */
  helpText?: string;
  /** Displays the optional tag when set to true. */
  isOptional?: boolean;
  /** Alert displayed below the input. */
  alert?: IInputContainerAlert;
}

export declare const InputFileAvatar: React.ComponentType<InputFileAvatarProps>;
