import {
    Button,
    Card,
    Dropdown,
    IconType,
    InputText,
} from '@aragon/gov-ui-kit';
import classNames from 'classnames';
import { useWatch } from 'react-hook-form';
import { useTranslations } from '@/shared/components/translationsProvider';
import { useFormField } from '@/shared/hooks/useFormField';

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
    /**
     * Stacks the fields with a remove button instead of a row with a menu.
     * @default false
     */
    isStacked?: boolean;
}

type ResourcesInputItemBaseForm = Record<string, string>;

export const ResourcesInputItem: React.FC<IResourcesInputItemProps> = (
    props,
) => {
    const { name, index, remove, isStacked = false } = props;

    const { t } = useTranslations();

    /**
     * URL Regex:
     * - Optional protocol (http:// or https://)
     * - Domain with one or more subdomains
     * - Optional path
     * - Optional query string
     * - Optional fragment identifier
     */
    const urlRegex =
        /^(https?:\/\/)?(([\da-zA-Z-]+\.)+[a-zA-Z]{2,})(\/[^\s?#]*)?(\?[^\s#]*)?(#[^\s]*)?$/;

    const urlFieldName = `${name}.${index.toString()}.url`;
    const urlValue = useWatch<ResourcesInputItemBaseForm>({
        name: urlFieldName,
    });
    const urlField = useFormField<
        ResourcesInputItemBaseForm,
        typeof urlFieldName
    >(urlFieldName, {
        label: t('app.shared.resourcesInput.item.linkInput.title'),
        defaultValue: '',
        rules: { required: true, pattern: urlRegex },
        trimOnBlur: true,
    });

    const nameFieldName = `${name}.${index.toString()}.name`;
    const nameField = useFormField<
        ResourcesInputItemBaseForm,
        typeof nameFieldName
    >(nameFieldName, {
        label: t('app.shared.resourcesInput.item.labelInput.title'),
        defaultValue: '',
        trimOnBlur: true,
    });

    const namePlaceholder =
        typeof urlValue === 'string' && urlValue.length > 0
            ? urlValue
            : undefined;

    return (
        <Card
            className={classNames(
                'flex flex-col gap-related shadow-neutral-sm',
                {
                    'md:flex-row md:gap-related--fixed-8': !isStacked,
                },
            )}
            inset="surface-wide"
        >
            <InputText
                placeholder={t(
                    'app.shared.resourcesInput.item.linkInput.placeholder',
                )}
                {...urlField}
            />

            <InputText
                isOptional={true}
                maxLength={40}
                placeholder={namePlaceholder}
                {...nameField}
            />
            {isStacked ? (
                <Button
                    className="w-fit"
                    iconLeft={IconType.CLOSE}
                    onClick={() => remove(index)}
                    size="sm"
                    variant="tertiary"
                >
                    {t('app.shared.resourcesInput.item.removeResource')}
                </Button>
            ) : (
                <div className="mt-0 md:mt-9">
                    <Dropdown.Container
                        constrainContentWidth={false}
                        customTrigger={
                            <Button
                                iconLeft={IconType.DOTS_VERTICAL}
                                size="lg"
                                variant="tertiary"
                            />
                        }
                        size="md"
                    >
                        <Dropdown.Item onClick={() => remove(index)}>
                            {t('app.shared.resourcesInput.item.removeResource')}
                        </Dropdown.Item>
                    </Dropdown.Container>
                </div>
            )}
        </Card>
    );
};
