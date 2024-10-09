import { useProcessFields } from '@/modules/governance/components/createProcessForm/hooks/useProcessFields';
import { ResourcesInput } from '@/shared/components/forms/resourcesInput';
import { useTranslations } from '@/shared/components/translationsProvider';
import { InputText, TextArea } from '@aragon/ods';

export interface ICreateProcessFormMetadataProps {}

export const CreateProcessFormMetadata: React.FC<ICreateProcessFormMetadataProps> = () => {
    const { nameField, keyField, summaryField } = useProcessFields('process');

    const { t } = useTranslations();

    return (
        <div className="flex flex-col gap-10">
            <InputText
                helpText={t('app.governance.createProcessForm.process.name.helpText')}
                placeholder={t('app.governance.createProcessForm.process.name.placeholder')}
                maxLength={18}
                {...nameField}
            />
            <InputText
                helpText={t('app.governance.createProcessForm.process.key.helpText')}
                placeholder={t('app.governance.createProcessForm.process.key.placeholder')}
                maxLength={5}
                addon={keyField.value != '' ? '-01' : undefined}
                addonPosition="right"
                {...keyField}
                onChange={(e) => {
                    const upperValue = e.target.value.toUpperCase();
                    keyField.onChange({
                        ...e,
                        target: {
                            ...e.target,
                            value: upperValue,
                        },
                    });
                }}
            />
            <TextArea
                helpText={t('app.governance.createProcessForm.process.summary.helpText')}
                placeholder={t('app.governance.createProcessForm.process.summary.placeholder')}
                isOptional={true}
                maxLength={480}
                {...summaryField}
            />
            <ResourcesInput
                name="process.resources"
                helpText={t('app.governance.createProcessForm.process.resources.helpText')}
            />
        </div>
    );
};
