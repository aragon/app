import { ResourcesInput } from '@/shared/components/resourceInput';
import { useTranslations } from '@/shared/components/translationsProvider';
import { useFormField } from '@/shared/hooks/useFormField';
import { InputText, Switch, TextArea, TextAreaRichText } from '@aragon/ods';
import { type FieldPath, type FieldValues, type UseControllerReturn } from 'react-hook-form';

export interface ICreateProposalFormMetadataProps {}

export const CreateProposalFormMetadata: React.FC<ICreateProposalFormMetadataProps> = () => {
    const { t } = useTranslations();

    const titleField = useFormField('title', {
        label: t('app.governance.createProposalForm.metadata.title.title'),
        rules: {
            required: true,
        },
        defaultValue: '',
    });
    const summaryField = useFormField('summary', {
        label: t('app.governance.createProposalForm.metadata.summary.title'),
    });

    const { ref: bodyRef, ...bodyField } = useFormField('body', {
        label: t('app.governance.createProposalForm.metadata.body.title'),
    });
    const { ref: addActionsRef, ...addActionsField } = useFormField('addActions', {
        label: t('app.governance.createProposalForm.metadata.actions.title'),
        defaultValue: true,
    });

    function handleBlur<TFieldValues extends FieldValues>(
        e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLDivElement>,
        field: UseControllerReturn<TFieldValues, FieldPath<TFieldValues>>['field'],
    ) {
        if ('value' in e.target) {
            const trimmedValue = e.target.value.trim();
            field.onChange(trimmedValue);
        }
        field.onBlur();
    }

    return (
        <div className="flex flex-col gap-10">
            <InputText
                helpText={t('app.governance.createProposalForm.metadata.title.helpText')}
                placeholder={t('app.governance.createProposalForm.metadata.title.placeholder')}
                maxLength={128}
                {...titleField}
                onBlur={(e) => handleBlur(e, titleField)}
            />
            <TextArea
                helpText={t('app.governance.createProposalForm.metadata.summary.helpText')}
                placeholder={t('app.governance.createProposalForm.metadata.summary.placeholder')}
                isOptional={true}
                maxLength={480}
                {...summaryField}
                onBlur={(e) => handleBlur(e, summaryField)}
            />
            <TextAreaRichText
                helpText={t('app.governance.createProposalForm.metadata.body.helpText')}
                placeholder={t('app.governance.createProposalForm.metadata.body.placeholder')}
                isOptional={true}
                immediatelyRender={false}
                {...bodyField}
            />
            <ResourcesInput
                name="resources"
                helpText={t('app.governance.createProposalForm.metadata.resources.helpText')}
                trim={(e, field) => handleBlur(e, field)}
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
