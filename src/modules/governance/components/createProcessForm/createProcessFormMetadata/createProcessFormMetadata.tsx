import { ResourcesInput } from '@/shared/components/forms/resourcesInput';
import { useTranslations } from '@/shared/components/translationsProvider';
import { useFormField } from '@/shared/hooks/useFormField';
import { InputText, Switch, TextArea, TextAreaRichText } from '@aragon/ods';
import type { ICreateProcessFormData } from '../createProcessFormDefinitions';

export interface ICreateProcessFormMetadataProps {}

export const CreateProcessFormMetadata: React.FC<ICreateProcessFormMetadataProps> = () => {
    const { t } = useTranslations();

    const titleField = useFormField<ICreateProcessFormData, 'title'>('title', {
        label: t('app.governance.createProcessForm.metadata.title.title'),
        rules: { required: true },
        defaultValue: '',
    });

    const summaryField = useFormField<ICreateProcessFormData, 'summary'>('summary', {
        label: t('app.governance.createProcessForm.metadata.summary.title'),
    });

    const { ref: bodyRef, ...bodyField } = useFormField<ICreateProcessFormData, 'body'>('body', {
        label: t('app.governance.createProcessForm.metadata.body.title'),
    });

    const { ref: addActionsRef, ...addActionsField } = useFormField<ICreateProcessFormData, 'addActions'>(
        'addActions',
        {
            label: t('app.governance.createProcessForm.metadata.actions.title'),
            defaultValue: true,
        },
    );

    return (
        <div className="flex flex-col gap-10">
            <InputText
                helpText={t('app.governance.createProcessForm.metadata.title.helpText')}
                placeholder={t('app.governance.createProcessForm.metadata.title.placeholder')}
                maxLength={128}
                {...titleField}
            />
            <TextArea
                helpText={t('app.governance.createProcessForm.metadata.summary.helpText')}
                placeholder={t('app.governance.createProcessForm.metadata.summary.placeholder')}
                isOptional={true}
                maxLength={480}
                {...summaryField}
            />
            <TextAreaRichText
                helpText={t('app.governance.createProcessForm.metadata.body.helpText')}
                placeholder={t('app.governance.createProcessForm.metadata.body.placeholder')}
                isOptional={true}
                immediatelyRender={false}
                {...bodyField}
            />
            <ResourcesInput
                name="resources"
                helpText={t('app.governance.createProcessForm.metadata.resources.helpText')}
            />
            <Switch
                helpText={t('app.governance.createProcessForm.metadata.actions.helpText')}
                inlineLabel={t('app.governance.createProcessForm.metadata.actions.label')}
                onCheckedChanged={addActionsField.onChange}
                checked={addActionsField.value}
                {...addActionsField}
            />
        </div>
    );
};
