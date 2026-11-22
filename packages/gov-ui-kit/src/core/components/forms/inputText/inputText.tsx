import classNames from 'classnames';
import { forwardRef } from 'react';
import { Icon } from '../../icon';
import { useInputProps } from '../hooks';
import { InputContainer, type InputVariant } from '../inputContainer';
import type { IInputTextProps } from './inputText.api';

const variantToAddonClassNames: Record<InputVariant | 'disabled', string> = {
    default: 'bg-surface-secondary border-surface-primary text-surface-secondary',
    warning: 'bg-warning-subtle border-warning-primary-input text-warning-primary-input',
    critical: 'bg-critical-subtle border-critical-primary-input text-critical-primary-input',
    disabled: 'bg-surface-secondary border-surface-disabled text-surface-secondary',
};

const variantToIconClassNames: Record<InputVariant | 'disabled', string> = {
    default: 'icon-surface-primary',
    warning: 'icon-warning-primary-input',
    critical: 'icon-critical-primary-input',
    disabled: 'icon-surface-disabled',
};

/**
 * Usage notes:
 *
 * - When `maxLength` is set, an uncontrolled `defaultValue` does not initialize the character counter: it starts at
 *   `0` and updates after an input change; controlled `value` changes synchronize it immediately.
 * - `addon` renders only when its string is non-empty after trimming, and is displayed as literal text rather than
 *   parsed markup.
 */
export const InputText = forwardRef<HTMLInputElement, IInputTextProps>((props, ref) => {
    const { addonPosition = 'left', addon, iconLeft, iconRight, ...otherProps } = props;
    const { containerProps, inputProps } = useInputProps(otherProps);

    const {
        wrapperClassName: containerWrapperClassName,
        variant = 'default',
        disabled,
        ...otherContainerProps
    } = containerProps;

    const showAddon = addon && addon.trim() !== '';
    const variantKey = disabled ? 'disabled' : variant;

    const addonClasses = classNames(
        'flex h-[stretch] shrink-0 items-center justify-center px-control-md type-control',
        variantToAddonClassNames[variantKey],
        { 'border-r-[1px]': addonPosition === 'left' },
        { 'order-last border-l-[1px]': addonPosition === 'right' },
    );

    const iconClasses = classNames('shrink-0', variantToIconClassNames[variantKey]);

    return (
        <InputContainer
            disabled={disabled}
            variant={variant}
            wrapperClassName={classNames('overflow-hidden', containerWrapperClassName)}
            {...otherContainerProps}
        >
            {showAddon && (
                <div className={addonClasses} data-testid="input-addon">
                    {addon}
                </div>
            )}
            {iconLeft != null && (
                <Icon className={classNames(iconClasses, 'ml-control-lg')} icon={iconLeft} size="md" />
            )}
            <input ref={ref} type="text" {...inputProps} />
            {iconRight != null && (
                <Icon className={classNames(iconClasses, 'mr-control-lg')} icon={iconRight} size="md" />
            )}
        </InputContainer>
    );
});

InputText.displayName = 'InputText';
