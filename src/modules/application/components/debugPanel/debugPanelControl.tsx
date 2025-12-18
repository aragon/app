import { InputText, Switch } from '@aragon/gov-ui-kit';
import { type IDebugContextControl, useDebugContext } from '@/shared/components/debugProvider';
import { sanitizePlainText } from '@/shared/security';

export interface IDebugPanelControlProps {
    /**
     * Control to be rendered.
     */
    control: IDebugContextControl;
}

export const DebugPanelControl: React.FC<IDebugPanelControlProps> = (props) => {
    const { control } = props;

    const { type, name, label, onChange } = control;

    const { values, updateValue } = useDebugContext();

    const handleValueChange = (name: string, value: unknown, onChange?: IDebugContextControl['onChange']) => {
        updateValue(name, value);
        onChange?.(value);
    };

    if (type === 'boolean') {
        return (
            <Switch
                checked={values[name] as boolean}
                inlineLabel={label}
                onCheckedChanged={(event) => handleValueChange(name, event, onChange)}
            />
        );
    }

    return (
        <InputText
            label={label}
            onChange={({ target }) => handleValueChange(name, sanitizePlainText(target.value), onChange)}
            value={(values[name] as string | undefined) ?? ''}
        />
    );
};
