import { useTranslations } from '@/shared/components/translationsProvider';
import { useFormField } from '@/shared/hooks/useFormField';
import { InputText, Switch, TextArea, TextAreaRichText } from '@aragon/ods';
import { ResourcesInput } from './resourcesInput';

export interface ICreateProposalFormMetadataProps {}

export const CreateProposalFormMetadata: React.FC<ICreateProposalFormMetadataProps> = () => {
    const { t } = useTranslations();

    const titleField = useFormField('title', {
        label: t('app.createProposalForm.metadata.title.title'),
        rules: { required: true },
        defaultValue: '',
    });
    const summaryField = useFormField('summary', {
        label: t('app.createProposalForm.metadata.summary.title'),
        rules: { required: true },
    });

    const { ref: bodyRef, ...bodyField } = useFormField('body', {
        label: t('app.createProposalForm.metadata.body.title'),
    });
    const { ref: addActionsRef, ...addActionsField } = useFormField('addActions', {
        label: t('app.createProposalForm.metadata.actions.title'),
        defaultValue: true,
    });

    return (
        <div className="flex flex-col gap-10">
            <InputText
                helpText={t('app.createProposalForm.metadata.title.helpText')}
                placeholder={t('app.createProposalForm.metadata.title.placeholder')}
                {...titleField}
            />
            <TextArea
                helpText={t('app.createProposalForm.metadata.summary.helpText')}
                placeholder={t('app.createProposalForm.metadata.summary.placeholder')}
                {...summaryField}
            />
            <TextAreaRichText
                helpText={t('app.createProposalForm.metadata.body.helpText')}
                placeholder={t('app.createProposalForm.metadata.body.placeholder')}
                isOptional={true}
                immediatelyRender={false}
                {...bodyField}
            />
            <ResourcesInput />
            <Switch
                helpText={t('app.createProposalForm.metadata.actions.helpText')}
                inlineLabel={t('app.createProposalForm.metadata.actions.label')}
                onCheckedChanged={addActionsField.onChange}
                checked={addActionsField.value}
                {...addActionsField}
            />
        </div>
    );
};
