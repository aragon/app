import { useTranslations } from '@/shared/components/translationsProvider';
import { useFormField } from '@/shared/hooks/useFormField';
import { InputText, Switch, TextArea, TextAreaRichText } from '@aragon/ods';
import { ResourcesInput } from '../resourcesInput';

export interface ICreateProposalFormMetadataProps {}

export const CreateProposalFormMetadata: React.FC<ICreateProposalFormMetadataProps> = () => {
    const { t } = useTranslations();

    const titleField = useFormField('title', {
        label: t('app.createProposal.createProposalForm.title.title'),
        rules: { required: true },
        defaultValue: '',
    });
    const summaryField = useFormField('summary', {
        label: t('app.createProposal.createProposalForm.summary.title'),
        rules: { required: true },
    });

    const { ref: bodyRef, ...bodyField } = useFormField('body', {
        label: t('app.createProposal.createProposalForm.body.title'),
    });
    const { ref: addActionsRef, ...addActionsField } = useFormField('addActions', {
        label: t('app.createProposal.createProposalForm.actions.title'),
        defaultValue: true,
    });

    return (
        <div className="flex flex-col gap-10">
            <InputText
                helpText={t('app.createProposal.createProposalForm.title.helpText')}
                placeholder={t('app.createProposal.createProposalForm.title.placeholder')}
                {...titleField}
            />
            <TextArea
                helpText={t('app.createProposal.createProposalForm.summary.helpText')}
                placeholder={t('app.createProposal.createProposalForm.summary.placeholder')}
                {...summaryField}
            />
            <TextAreaRichText
                helpText={t('app.createProposal.createProposalForm.body.helpText')}
                placeholder={t('app.createProposal.createProposalForm.body.placeholder')}
                isOptional={true}
                immediatelyRender={false}
                {...bodyField}
            />
            <ResourcesInput />
            <Switch
                helpText={t('app.createProposal.createProposalForm.actions.helpText')}
                inlineLabel={t('app.createProposal.createProposalForm.actions.label')}
                onCheckedChanged={addActionsField.onChange}
                checked={addActionsField.value}
                {...addActionsField}
            />
        </div>
    );
};
