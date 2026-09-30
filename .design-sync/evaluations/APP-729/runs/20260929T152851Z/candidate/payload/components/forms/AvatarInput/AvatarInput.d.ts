import * as React from 'react';

/**
 * AvatarInput — from @aragon/app@1.39.1 (apps/app/src/shared/components/forms/avatarInput/avatarInput.tsx).
 */
export interface AvatarInputProps {
  /** The name of the field in the form. */
  name: string;
  /** Label for the input. Defaults to the shared avatar label translation. */
  label?: string;
  /** Help text to display below the input. */
  helpText?: string;
  /** The prefix of the field in the form. */
  fieldPrefix?: string;
  /** Maximum file size in bytes. */
  maxFileSize?: number;
  /** Maximum dimension (width/height) in pixels. */
  maxDimension?: number;
  /** Whether the field is optional. */
  isOptional?: boolean;
  /** Optional default value to init field with. */
  defaultValue?: IInputFileAvatarValue;
}

import type { IInputFileAvatarValue } from '@aragon/gov-ui-kit';

export declare const AvatarInput: React.ComponentType<AvatarInputProps>;
