import { ResourcesInput } from '@/shared/components/forms/resourcesInput';
import { useTranslations } from '@/shared/components/translationsProvider';
import { useFormField } from '@/shared/hooks/useFormField';
import { InputText, Switch, TextArea, TextAreaRichText } from '@aragon/gov-ui-kit';
import type { ICreateProposalFormData } from '../createProposalFormDefinitions';

export interface ICreateProposalFormMetadataProps {}

export const CreateProposalFormMetadata: React.FC<ICreateProposalFormMetadataProps> = () => {
    const { t } = useTranslations();

    const titleField = useFormField<ICreateProposalFormData, 'title'>('title', {
        label: t('app.governance.createProposalForm.metadata.title.title'),
        rules: {
            required: true,
        },
        trimOnBlur: true,
        defaultValue: '',
    });

    const summaryField = useFormField<ICreateProposalFormData, 'summary'>('summary', {
        label: t('app.governance.createProposalForm.metadata.summary.title'),
        trimOnBlur: true,
    });

    const { ref: bodyRef, ...bodyField } = useFormField<ICreateProposalFormData, 'body'>('body', {
        label: t('app.governance.createProposalForm.metadata.body.title'),
    });

    const { ref: addActionsRef, ...addActionsField } = useFormField<ICreateProposalFormData, 'addActions'>(
        'addActions',
        {
            label: t('app.governance.createProposalForm.metadata.actions.title'),
            defaultValue: true,
        },
    );

    return (
        <div className="flex flex-col gap-10">
            <InputText maxLength={128} {...titleField} />
            <TextArea
                helpText={t('app.governance.createProposalForm.metadata.summary.helpText')}
                isOptional={true}
                maxLength={480}
                {...summaryField}
            />
            <TextAreaRichText
                isOptional={true}
                immediatelyRender={false}
                helpText={t('app.governance.createProposalForm.metadata.body.helpText')}
                {...bodyField}
            />
            <ResourcesInput
                name="resources"
                helpText={t('app.governance.createProposalForm.metadata.resources.helpText')}
            />
            <Switch
                helpText={t('app.governance.createProposalForm.metadata.actions.helpText')}
                inlineLabel={t('app.governance.createProposalForm.metadata.actions.label')}
                onCheckedChanged={addActionsField.onChange}
                checked={addActionsField.value}
                {...addActionsField}
            />
        </div>
    );
};
