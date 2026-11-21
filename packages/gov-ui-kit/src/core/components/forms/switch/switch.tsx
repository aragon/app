import * as RadixSwitch from '@radix-ui/react-switch';
import classNames from 'classnames';
import { useRandomId } from '../../../hooks';
import { type IInputContainerBaseProps, InputContainer } from '../inputContainer';

export interface ISwitchProps extends Pick<IInputContainerBaseProps, 'alert' | 'label' | 'helpText' | 'isOptional'> {
    /**
     * Indicates whether the switch is checked
     */
    checked?: boolean;
    /**
     * CSS class name
     */
    className?: string;
    /**
     * The default checked state of the switch
     * @default false
     */
    defaultChecked?: boolean;
    /**
     * Indicates whether the switch is disabled
     * @default false
     */
    disabled?: boolean;
    /**
     * The ID of the switch
     */
    id?: string;
    /**
     * The inline label of the switch
     */
    inlineLabel?: string;
    /**
     * The name of the switch
     */
    name?: string;
    /**
     * Event handler for when the checked state changes
     * @param checked - The new checked state
     */
    onCheckedChanged?: (checked: boolean) => void;
}

export const Switch: React.FC<ISwitchProps> = (props) => {
    const {
        checked,
        className,
        defaultChecked = false,
        disabled = false,
        id,
        inlineLabel,
        name,
        onCheckedChanged,
        ...otherProps
    } = props;

    const randomId = useRandomId(id);

    const switchClassNames = classNames(
        'group peer w-10 cursor-default rounded-[40px] border border-surface-default-switch bg-surface-default p-1 focus-ring ring-accent-focus shadow-surface-sm', // Default
        'data-[state=checked]:border-surface-selected data-[state=checked]:shadow-accent-default', // Checked
        'disabled:bg-surface-disabled disabled:data-[state=checked]:border-surface-disabled disabled:data-[state=checked]:shadow-none', // Disabled
    );

    const thumbClassNames = classNames(
        'block size-4 rounded-full transition-transform duration-100 will-change-transform bg-icon-surface-secondary', // Default
        'data-[state=checked]:translate-x-[14px] data-[state=checked]:bg-icon-accent-primary', // Checked
        'group-disabled:bg-neutral-200 data-[state=checked]:group-disabled:bg-icon-surface-secondary', // Disabled
    );

    const labelClassNames = classNames(
        'pl-2 text-sm leading-tight font-normal text-surface-secondary md:pl-3 md:text-base', // Default
        'peer-data-[state=checked]:text-surface-primary', // Checked
        'peer-disabled:text-surface-disabled peer-data-[state=checked]:peer-disabled:text-surface-primary', // Disabled
    );

    return (
        <InputContainer id={randomId} useCustomWrapper={true} {...otherProps}>
            <div className={classNames('inline-flex items-center', className)}>
                <RadixSwitch.Root
                    checked={checked}
                    className={switchClassNames}
                    defaultChecked={defaultChecked}
                    disabled={disabled}
                    id={randomId}
                    name={name}
                    onCheckedChange={onCheckedChanged}
                >
                    <RadixSwitch.Thumb className={thumbClassNames} />
                </RadixSwitch.Root>
                {inlineLabel && (
                    <label className={labelClassNames} htmlFor={randomId}>
                        {inlineLabel}
                    </label>
                )}
            </div>
        </InputContainer>
    );
};
