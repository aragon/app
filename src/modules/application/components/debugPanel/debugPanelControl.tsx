import { useDebugContext, type IDebugContextControl } from '@/shared/components/debugProvider';
import { InputText, Switch } from '@aragon/gov-ui-kit';

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
                onCheckedChanged={(event) => handleValueChange(name, event, onChange)}
                inlineLabel={label}
            />
        );
    }

    return (
        <InputText
            value={(values[name] as string | undefined) ?? ''}
            onChange={({ target }) => handleValueChange(name, target.value, onChange)}
            label={label}
        />
    );
};
