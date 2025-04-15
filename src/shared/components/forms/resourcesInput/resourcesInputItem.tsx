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

    const nameFieldName = `${name}.${index.toString()}.name`;
    const nameField = useFormField<ResourcesInputItemBaseForm, typeof nameFieldName>(nameFieldName, {
        label: t('app.shared.resourcesInput.item.labelInput.title'),
        rules: { required: true },
        defaultValue: '',
        trimOnBlur: true,
    });

    /**
     * URL Regex:
     * - Optional protocol (http:// or https://)
     * - Domain with one or more subdomains
     * - Optional path
     * - Optional query string
     * - Optional fragment identifier
     */
    const urlRegex = /^(https?:\/\/)?(([\da-zA-Z-]+\.)+[a-zA-Z]{2,})(\/[^\s?#]*)?(\?[^\s#]*)?(#[^\s]*)?$/;

    const urlFieldName = `${name}.${index.toString()}.url`;
    const urlField = useFormField<ResourcesInputItemBaseForm, typeof urlFieldName>(urlFieldName, {
        label: t('app.shared.resourcesInput.item.linkInput.title'),
        defaultValue: '',
        rules: { required: true, pattern: urlRegex },
        trimOnBlur: true,
    });

    return (
        <Card className="flex flex-col items-end gap-3 border border-neutral-100 p-6 shadow-neutral-sm md:flex-row md:items-start md:gap-2">
            <InputText className="w-full" maxLength={40} {...nameField} />

            <InputText
                className="min-h-[99px] w-full md:min-h-0"
                placeholder={t('app.shared.resourcesInput.item.linkInput.placeholder')}
                {...urlField}
            />
            <div className="md:flex md:min-h-[114.5px] md:items-center">
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
