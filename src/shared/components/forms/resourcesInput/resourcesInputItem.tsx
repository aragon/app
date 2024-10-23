import { useTranslations } from '@/shared/components/translationsProvider';
import { useFormField } from '@/shared/hooks/useFormField';
import { Button, Card, Dropdown, IconType, InputText } from '@aragon/gov-ui-kit';

export interface IResourcesInputItemProps {
    /**
     * Name of the field.
     */
    name: string;
    /**
     * The index of the resource item in the list.
     */
    index: number;
    /**
     * Callback to remove the resource item.
     */
    remove: (index: number) => void;
}

type ResourcesInputItemBaseForm = Record<string, string>;

export const ResourcesInputItem: React.FC<IResourcesInputItemProps> = (props) => {
    const { name, index, remove } = props;

    const { t } = useTranslations();

    const nameFieldName = `${name}.${index}.name`;
    const nameField = useFormField<ResourcesInputItemBaseForm, typeof nameFieldName>(nameFieldName, {
        label: t('app.shared.resourcesInput.item.labelInput.title'),
        rules: { required: true },
        defaultValue: '',
        trimOnBlur: true,
    });

    const urlFieldName = `${name}.${index}.url`;
    const urlField = useFormField<ResourcesInputItemBaseForm, typeof urlFieldName>(urlFieldName, {
        label: t('app.shared.resourcesInput.item.linkInput.title'),
        defaultValue: '',
        rules: { required: true, pattern: /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/ },
        trimOnBlur: true,
    });

    return (
        <Card className="flex flex-col gap-3 border border-neutral-100 p-6 shadow-neutral-sm md:flex-row md:gap-2">
            <InputText
                placeholder={t('app.shared.resourcesInput.item.labelInput.placeholder')}
                maxLength={40}
                {...nameField}
            />

            <InputText placeholder={t('app.shared.resourcesInput.item.linkInput.placeholder')} {...urlField} />
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
