'use client';

import { type IInputTextProps, InputText } from '@aragon/gov-ui-kit';

export interface IMpcPasswordInputProps extends IInputTextProps {}

// gov-ui-kit InputText does not expose the "type" attribute in its props but forwards unknown props to the input.
const passwordInputProps = { type: 'password' } as unknown as IInputTextProps;

/**
 * InputText rendered as a password field (passphrases / mock passwords never displayed in clear).
 */
export const MpcPasswordInput: React.FC<IMpcPasswordInputProps> = (props) => (
    <InputText {...passwordInputProps} {...props} />
);
