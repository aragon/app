import {
    Button,
    IconType,
    type IInputComponentProps,
    InputContainer,
    mergeRefs,
    useInputProps,
    useNumberMask,
} from '@aragon/gov-ui-kit';
import classNames from 'classnames';
import type { Ref } from 'react';

export interface IGasLimitInputProps
    extends Omit<
        IInputComponentProps,
        'onChange' | 'step' | 'min' | 'max' | 'maxLength'
    > {
    /**
     * The minimum value that the gas-limit input accepts.
     */
    min: number;
    /**
     * The maximum value that the gas-limit input accepts.
     */
    max: number;
    /**
     * Granularity of the increment/decrement controls.
     */
    step: number;
    /**
     * Callback called when the gas-limit value changes.
     */
    onChange?: (value: string) => void;
    /**
     * Label of the calculate button.
     */
    calculateLabel: string;
    /**
     * Whether the calculate button is disabled.
     */
    calculateDisabled?: boolean;
    /**
     * Whether the gas limit is currently being calculated.
     */
    isCalculating?: boolean;
    /**
     * Callback called when the calculate button is clicked.
     */
    onCalculate: () => void;
    /**
     * Ref forwarded to the underlying input element.
     */
    ref?: Ref<HTMLInputElement>;
}

// TODO: update number input in ui-kit to support additional button
export const GasLimitInput: React.FC<IGasLimitInputProps> = (props) => {
    const {
        min,
        max,
        step,
        onChange,
        calculateLabel,
        calculateDisabled,
        isCalculating,
        onCalculate,
        ref: forwardedRef,
        ...otherProps
    } = props;

    const { containerProps, inputProps } = useInputProps(otherProps);
    const { className, disabled, ...otherContainerProps } = containerProps;
    const { className: inputClassName, value, ...otherInputProps } = inputProps;

    const { ref, unmaskedValue, setUnmaskedValue } = useNumberMask({
        min,
        max,
        value: value as string | undefined,
        onChange,
    });

    // Mirrors gov-ui-kit's own InputNumber stepper logic so both controls and the calculate
    // action can live inside the same InputContainer box.
    const adjustValue = (direction: 1 | -1) => {
        const current = Number(unmaskedValue);
        const nextMultiple =
            (direction > 0
                ? Math.floor(current / step)
                : Math.ceil(current / step)) + direction;
        const nextValue = Math.min(
            max,
            Math.max(min, nextMultiple * step),
        ).toString();

        setUnmaskedValue(nextValue);
        onChange?.(nextValue);
    };

    return (
        <InputContainer
            className={className}
            disabled={disabled}
            {...otherContainerProps}
        >
            {!disabled && (
                <Button
                    className="ml-2 shrink-0"
                    iconLeft={IconType.MINUS}
                    onClick={() => adjustValue(-1)}
                    size="sm"
                    variant="tertiary"
                />
            )}
            <input
                className={classNames(
                    'spin-buttons-hidden text-center',
                    inputClassName,
                )}
                inputMode="numeric"
                max={max}
                min={min}
                ref={mergeRefs([ref, forwardedRef])}
                step={step}
                {...otherInputProps}
            />
            {!disabled && (
                <Button
                    className="mr-2 shrink-0"
                    iconLeft={IconType.PLUS}
                    onClick={() => adjustValue(1)}
                    size="sm"
                    variant="tertiary"
                />
            )}
            {!disabled && (
                <Button
                    className="mr-2 shrink-0 border-neutral-100 border-l pl-2"
                    disabled={calculateDisabled}
                    iconLeft={IconType.RELOAD}
                    isLoading={isCalculating}
                    onClick={onCalculate}
                    size="sm"
                    variant="tertiary"
                >
                    {calculateLabel}
                </Button>
            )}
        </InputContainer>
    );
};
