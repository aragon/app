import classNames from 'classnames';
import React, { forwardRef } from 'react';
import { AlertInline } from '../../alerts';
import { useGukCoreContext } from '../../gukCoreProvider';
import { Tag } from '../../tag';
import type { IInputContainerProps, InputVariant } from './inputContainer.api';

const variantToClassNames: Record<InputVariant | 'disabled', string[]> = {
    default: [
        'border-surface-default bg-surface-default shadow-surface-sm', // Default state
        'hover:border-surface-hover hover:shadow-surface-default', // Hover state
        'focus-within:border-accent-active focus-within:shadow-accent-default', // Focus state
        'focus-within:hover:border-accent-active focus-within:hover:shadow-accent-default', // Focus + Hover state
    ],
    warning: [
        'border-warning-default-input bg-surface-default shadow-warning-sm', // Default state
        'hover:border-warning-hover-input hover:shadow-warning-default', // Hover state
        'focus-within:border-warning-active focus-within:shadow-warning-default', // Focus state
        'focus-within:hover:border-warning-active-control focus-within:hover:shadow-warning-default', // Focus + Hover state
    ],
    critical: [
        'border-critical-default-input bg-surface-default shadow-critical-sm', // Default state
        'hover:border-critical-hover-input hover:shadow-critical-default', // Hover state
        'focus-within:border-critical-active focus-within:shadow-critical-default', // Focus state
        'focus-within:hover:border-critical-active-control focus-within:hover:shadow-critical-default', // Focus + Hover state
    ],
    disabled: ['border-surface-disabled bg-surface-disabled'],
};

/**
 * The InputContainer component provides a consistent and shared styling foundation for various input components, such
 * as `InputText`, `InputNumber` and others. It also manages properties that are shared across all input components,
 * including `label`, `helpText` and more.
 */
export const InputContainer = forwardRef<HTMLDivElement, IInputContainerProps>((props, ref) => {
    const { copy } = useGukCoreContext();
    const {
        label,
        variant = 'default',
        helpText,
        isOptional,
        maxLength,
        inputLength = 0,
        alert,
        disabled,
        children,
        className,
        wrapperClassName,
        id,
        useCustomWrapper,
        spacing = 'default',
        ...otherProps
    } = props;

    const processedVariant = disabled ? 'disabled' : variant;
    const containerClasses = classNames(
        'flex min-h-control-lg w-full flex-row items-center', // Layout
        'rounded-xl border text-surface-secondary transition-all', // Styling
        'text-base leading-tight font-normal', // Typography
        variantToClassNames[processedVariant],
        wrapperClassName,
    );

    const counterClasses = classNames('text-xs leading-tight font-normal text-surface-secondary md:text-sm', {
        'animate-shake': inputLength === maxLength,
    });

    const InputWrapper = useCustomWrapper ? React.Fragment : 'div';
    const containerProps = useCustomWrapper ? {} : { className: containerClasses };

    return (
        <div
            className={classNames(
                'flex grow flex-col',
                { 'gap-related--8-12': spacing === 'default', 'gap-related': spacing === 'related' },
                className,
            )}
            ref={ref}
            {...otherProps}
        >
            {(label != null || helpText != null) && (
                <label className="flex flex-col gap-tight--2-4" htmlFor={id}>
                    {label && (
                        <div className="flex flex-row items-center gap-related">
                            <p className="text-base leading-tight font-normal text-surface-primary md:text-lg">
                                {label}
                            </p>
                            {isOptional && <Tag label={copy.inputContainer.optionalLabel} variant="neutral" />}
                        </div>
                    )}
                    {helpText && (
                        <p className="text-sm leading-normal font-normal text-surface-secondary md:text-base">
                            {helpText}
                        </p>
                    )}
                </label>
            )}
            <InputWrapper {...containerProps}>{children}</InputWrapper>
            {maxLength != null && !alert && (
                <p className={counterClasses}>
                    {inputLength}/{maxLength}
                </p>
            )}
            {alert && <AlertInline message={alert.message} variant={alert.variant} />}
        </div>
    );
});

InputContainer.displayName = 'InputContainer';
