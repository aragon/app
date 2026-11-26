import { InputText, Radio, RadioGroup, Switch } from '@aragon/gov-ui-kit';
import {
    type IDebugContextControl,
    useDebugContext,
} from '@/shared/components/debugProvider';
import { sanitizePlainText } from '@/shared/security';
import { AddressInputControl } from './addressInputControl';
import type { IDebugPanelControlProps } from './debugPanelControl.api';

export const DebugPanelControl: React.FC<IDebugPanelControlProps> = (props) => {
    const { control } = props;

    const { type, name, label, options, onChange } = control;

    const { values, updateValue } = useDebugContext();

    const handleValueChange = (
        name: string,
        value: unknown,
        onChange?: IDebugContextControl['onChange'],
    ) => {
        updateValue(name, value);
        onChange?.(value);
    };

    if (type === 'boolean') {
        return (
            <Switch
                checked={values[name] as boolean}
                inlineLabel={label}
                onCheckedChanged={(event) =>
                    handleValueChange(name, event, onChange)
                }
            />
        );
    }

    if (type === 'select') {
        return (
            <RadioGroup
                label={label}
                onValueChange={(value) =>
                    handleValueChange(name, value, onChange)
                }
                value={values[name] as string | undefined}
            >
                {options?.map((option) => (
                    <Radio
                        key={option.value}
                        label={option.label}
                        value={option.value}
                    />
                ))}
            </RadioGroup>
        );
    }

    if (type === 'address') {
        return (
            <AddressInputControl
                label={label}
                name={name}
                onChange={onChange}
            />
        );
    }

    return (
        <InputText
            label={label}
            onChange={({ target }) =>
                handleValueChange(
                    name,
                    sanitizePlainText(target.value),
                    onChange,
                )
            }
            value={(values[name] as string | undefined) ?? ''}
        />
    );
};
