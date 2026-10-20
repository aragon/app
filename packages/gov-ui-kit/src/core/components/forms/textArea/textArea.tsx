import classNames from 'classnames';
import { forwardRef } from 'react';
import { useInputProps } from '../hooks';
import { type IInputComponentProps, InputContainer } from '../inputContainer';

export interface ITextAreaProps extends IInputComponentProps<HTMLTextAreaElement> {}

/**
 * Usage notes:
 *
 * - When `maxLength` is set, an uncontrolled `defaultValue` does not initialize the character counter: it starts at
 *   `0` and updates after an input change; controlled `value` changes synchronize it immediately.
 * - The field wrapper is configured to grow and scroll, while the `<textarea>` starts with a `min-h-40` minimum
 *   height; size the surrounding layout rather than assuming a fixed-height field.
 */
export const TextArea = forwardRef<HTMLTextAreaElement, ITextAreaProps>((props, ref) => {
    const { containerProps, inputProps } = useInputProps(props);

    const { className: inputClassName, ...otherInputProps } = inputProps;
    const { wrapperClassName: containerWrapperClassName, ...otherContainerProps } = containerProps;

    return (
        <InputContainer
            wrapperClassName={classNames('grow overflow-auto rounded-br-none', containerWrapperClassName)}
            {...otherContainerProps}
        >
            <textarea
                className={classNames('min-h-40 leading-normal', inputClassName)}
                ref={ref}
                type="text"
                {...otherInputProps}
            />
        </InputContainer>
    );
});

TextArea.displayName = 'TextArea';
