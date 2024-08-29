import { useTranslations } from '@/shared/components/translationsProvider';
import { useFormField } from '@/shared/hooks/useFormField';
import { InputText, Switch, TextArea, TextAreaRichText } from '@aragon/ods';
import { ResourcesInput } from './resourcesInput';

export interface ICreateProposalFormMetadataProps {}

export const CreateProposalFormMetadata: React.FC<ICreateProposalFormMetadataProps> = () => {
    const { t } = useTranslations();

    const titleField = useFormField('title', {
        label: t('app.governance.createProposalForm.metadata.title.title'),
        rules: { required: true },
        defaultValue: '',
    });
    const summaryField = useFormField('summary', {
        label: t('app.governance.createProposalForm.metadata.summary.title'),
        rules: { required: true },
    });

    const { ref: bodyRef, ...bodyField } = useFormField('body', {
        label: t('app.governance.createProposalForm.metadata.body.title'),
    });
    const { ref: addActionsRef, ...addActionsField } = useFormField('addActions', {
        label: t('app.governance.createProposalForm.metadata.actions.title'),
        defaultValue: true,
    });

    return (
        <div className="flex flex-col gap-10">
            <InputText
                helpText={t('app.governance.createProposalForm.metadata.title.helpText')}
                placeholder={t('app.governance.createProposalForm.metadata.title.placeholder')}
                {...titleField}
            />
            <TextArea
                helpText={t('app.governance.createProposalForm.metadata.summary.helpText')}
                placeholder={t('app.governance.createProposalForm.metadata.summary.placeholder')}
                {...summaryField}
            />
            <TextAreaRichText
                helpText={t('app.governance.createProposalForm.metadata.body.helpText')}
                placeholder={t('app.governance.createProposalForm.metadata.body.placeholder')}
                isOptional={true}
                immediatelyRender={false}
                {...bodyField}
            />
            <ResourcesInput />
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
