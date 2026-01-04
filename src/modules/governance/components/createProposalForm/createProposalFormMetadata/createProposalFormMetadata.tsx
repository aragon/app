import {
    InputText,
    Switch,
    TextArea,
    TextAreaRichText,
} from '@aragon/gov-ui-kit';
import { ResourcesInput } from '@/shared/components/forms/resourcesInput';
import { useTranslations } from '@/shared/components/translationsProvider';
import { useFormField } from '@/shared/hooks/useFormField';
import type { ICreateProposalFormData } from '../createProposalFormDefinitions';

export interface ICreateProposalFormMetadataProps {}

export const CreateProposalFormMetadata: React.FC<
    ICreateProposalFormMetadataProps
> = () => {
    const { t } = useTranslations();

    const titleField = useFormField<ICreateProposalFormData, 'title'>('title', {
        label: t('app.governance.createProposalForm.metadata.title.title'),
        rules: {
            required: true,
        },
        trimOnBlur: true,
        defaultValue: '',
    });

    const summaryField = useFormField<ICreateProposalFormData, 'summary'>(
        'summary',
        {
            label: t(
                'app.governance.createProposalForm.metadata.summary.title',
            ),
            trimOnBlur: true,
            sanitizeMode: 'multiline',
        },
    );

    const bodyField = useFormField<ICreateProposalFormData, 'body'>('body', {
        label: t('app.governance.createProposalForm.metadata.body.title'),
    });

    const addActionsField = useFormField<ICreateProposalFormData, 'addActions'>(
        'addActions',
        {
            label: t(
                'app.governance.createProposalForm.metadata.actions.title',
            ),
            defaultValue: true,
        },
    );

    return (
        <div className="flex flex-col gap-10">
            <InputText maxLength={128} {...titleField} />
            <TextArea
                helpText={t(
                    'app.governance.createProposalForm.metadata.summary.helpText',
                )}
                isOptional={true}
                maxLength={480}
                {...summaryField}
            />
            <TextAreaRichText
                helpText={t(
                    'app.governance.createProposalForm.metadata.body.helpText',
                )}
                immediatelyRender={false}
                isOptional={true}
                {...bodyField}
            />
            <ResourcesInput
                helpText={t(
                    'app.governance.createProposalForm.metadata.resources.helpText',
                )}
                name="resources"
            />
            <Switch
                checked={addActionsField.value}
                helpText={t(
                    'app.governance.createProposalForm.metadata.actions.helpText',
                )}
                inlineLabel={t(
                    'app.governance.createProposalForm.metadata.actions.label',
                )}
                onCheckedChanged={addActionsField.onChange}
                {...addActionsField}
            />
        </div>
    );
};
