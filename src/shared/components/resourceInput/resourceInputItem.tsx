import { useTranslations } from '@/shared/components/translationsProvider';
import { useFormField } from '@/shared/hooks/useFormField';
import { Button, Card, Dropdown, IconType, InputText } from '@aragon/ods';
import { type FieldPath, type FieldValues, type UseControllerReturn } from 'react-hook-form';

export interface IResourceInputItemProps {
    /**
     * The index of the resource item in the list.
     */
    index: number;
    /**
     * Callback to remove the resource item.
     */
    remove: (index: number) => void;
    /**
     * Callback to be fired when input field is blurred.
     */
    trim?: <TFieldValues extends FieldValues>(
        e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>,
        field: UseControllerReturn<TFieldValues, FieldPath<TFieldValues>>['field'],
    ) => void;
}

export const ResourceInputItem: React.FC<IResourceInputItemProps> = (props) => {
    const { index, remove, trim } = props;
    const { t } = useTranslations();

    const labelField = useFormField(`resources.${index}.label`, {
        label: t('app.shared.resourcesInput.item.labelInput.title'),
        rules: { required: true },
        defaultValue: '',
    });

    const linkField = useFormField(`resources.${index}.link`, {
        label: t('app.shared.resourcesInput.item.linkInput.title'),
        defaultValue: '',
        rules: {
            required: true,
            pattern: /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/,
        },
    });

    function handleBlur<TFieldValues extends FieldValues>(
        e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>,
        field: UseControllerReturn<TFieldValues, FieldPath<TFieldValues>>['field'],
    ) {
        if (trim) {
            trim(e, field);
        }
        field.onBlur();
    }

    return (
        <Card className="flex flex-col gap-3 border border-neutral-100 p-6 shadow-neutral-sm md:flex-row md:gap-2">
            <InputText
                placeholder={t('app.shared.resourcesInput.item.labelInput.placeholder')}
                {...labelField}
                onBlur={(e) => handleBlur(e, labelField)}
            />
            <InputText
                placeholder={t('app.shared.resourcesInput.item.linkInput.placeholder')}
                {...linkField}
                onBlur={(e) => handleBlur(e, linkField)}
            />
            <div className="mt-0 md:mt-9">
                <Dropdown.Container
                    constrainContentWidth={false}
                    size="md"
                    customTrigger={<Button variant="tertiary" size="lg" iconLeft={IconType.DOTS_VERTICAL} />}
                >
                    <Dropdown.Item onClick={() => remove(index)}>
                        {t('app.shared.resourcesInput.item.removeResource')}
                    </Dropdown.Item>
                </Dropdown.Container>
            </div>
        </Card>
    );
};
