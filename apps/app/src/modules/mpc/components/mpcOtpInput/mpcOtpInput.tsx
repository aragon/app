'use client';

import classNames from 'classnames';
import { useRef } from 'react';

export interface IMpcOtpInputProps {
    /**
     * Current code value (digits only, up to 6 characters).
     */
    value: string;
    /**
     * Callback called with the new code on every change.
     */
    onChange: (value: string) => void;
    /**
     * Callback called when all 6 digits are filled (e.g. to auto-submit).
     */
    onComplete?: (value: string) => void;
    /**
     * Accessible label of the input group.
     */
    label: string;
    /**
     * Help text displayed below the boxes.
     */
    helpText?: string;
    /**
     * Error message displayed below the boxes (also styles the boxes as invalid).
     */
    errorMessage?: string;
    /**
     * Whether the input is disabled.
     */
    disabled?: boolean;
    /**
     * Whether the first empty box grabs the focus on mount.
     */
    autoFocus?: boolean;
}

const OTP_LENGTH = 6;
const digitsOnly = (value: string) => value.replace(/\D/g, '');

/**
 * One-time-code input (6 digit boxes): auto-advance, backspace navigation, paste of the full code and
 * autocomplete from OS-level code suggestions. The value is controlled by the parent.
 */
export const MpcOtpInput: React.FC<IMpcOtpInputProps> = (props) => {
    const {
        value,
        onChange,
        onComplete,
        label,
        helpText,
        errorMessage,
        disabled,
        autoFocus,
    } = props;

    const boxRefs = useRef<Array<HTMLInputElement | null>>([]);

    const focusBox = (index: number) =>
        boxRefs.current[Math.min(Math.max(index, 0), OTP_LENGTH - 1)]?.focus();

    const updateValue = (newValue: string) => {
        const normalized = digitsOnly(newValue).slice(0, OTP_LENGTH);
        onChange(normalized);

        if (normalized.length === OTP_LENGTH) {
            onComplete?.(normalized);
        } else {
            focusBox(normalized.length);
        }
    };

    // Each box renders one character of the value; typing in any box rewrites the value from its position (so
    // pasting a full code into the first box fills everything).
    const handleBoxInput = (index: number, boxValue: string) => {
        const digits = digitsOnly(boxValue);

        if (digits.length === 0) {
            updateValue(value.slice(0, index));

            return;
        }

        updateValue(value.slice(0, index) + digits);
    };

    const handleKeyDown = (
        index: number,
        event: React.KeyboardEvent<HTMLInputElement>,
    ) => {
        if (event.key === 'Backspace' && value[index] == null && index > 0) {
            event.preventDefault();
            updateValue(value.slice(0, index - 1));
        } else if (event.key === 'ArrowLeft') {
            event.preventDefault();
            focusBox(index - 1);
        } else if (event.key === 'ArrowRight') {
            event.preventDefault();
            focusBox(index + 1);
        }
    };

    const handlePaste = (event: React.ClipboardEvent<HTMLInputElement>) => {
        event.preventDefault();
        updateValue(event.clipboardData.getData('text'));
    };

    return (
        <fieldset className="flex flex-col gap-2 border-0 p-0">
            <legend className="mb-2 text-neutral-600 text-sm leading-tight md:text-base">
                {label}
            </legend>
            <div className="flex gap-2">
                {Array.from({ length: OTP_LENGTH }, (_, index) => (
                    <input
                        aria-invalid={errorMessage != null}
                        aria-label={`${label} ${(index + 1).toString()}/${OTP_LENGTH.toString()}`}
                        autoComplete={index === 0 ? 'one-time-code' : 'off'}
                        // biome-ignore lint/a11y/noAutofocus: intentional focus on the expected next action (POC demo UX)
                        autoFocus={autoFocus && index === 0}
                        className={classNames(
                            'h-12 w-10 rounded-xl border bg-neutral-0 text-center font-mono text-lg text-neutral-800 caret-neutral-500 outline-none transition-all md:h-14 md:w-12',
                            'focus:border-primary-400 focus:ring-4 focus:ring-primary-100',
                            'disabled:cursor-not-allowed disabled:bg-neutral-100 disabled:text-neutral-300',
                            errorMessage != null
                                ? 'border-critical-500'
                                : 'border-neutral-100',
                        )}
                        disabled={disabled}
                        inputMode="numeric"
                        key={index}
                        maxLength={OTP_LENGTH}
                        onChange={(event) =>
                            handleBoxInput(index, event.target.value)
                        }
                        onFocus={(event) => event.target.select()}
                        onKeyDown={(event) => handleKeyDown(index, event)}
                        onPaste={handlePaste}
                        pattern="[0-9]*"
                        ref={(element) => {
                            boxRefs.current[index] = element;
                        }}
                        type="text"
                        value={value[index] ?? ''}
                    />
                ))}
            </div>
            {errorMessage != null ? (
                <p className="text-critical-600 text-sm">{errorMessage}</p>
            ) : (
                helpText != null && (
                    <p className="text-neutral-500 text-sm">{helpText}</p>
                )
            )}
        </fieldset>
    );
};
