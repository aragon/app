import { type IProposalActionData } from '@/modules/governance/components/createProposalForm';
import { ResourcesInput } from '@/shared/components/forms/resourcesInput';
import { useTranslations } from '@/shared/components/translationsProvider';
import { useFormField } from '@/shared/hooks/useFormField';
import { InputText, type IProposalActionComponentProps, TextArea } from '@aragon/gov-ui-kit';
import { useEffect } from 'react';
import type { IUpdateMetadataFormData } from './updateMetadataFormDefinitions';

export interface IUpdatePluginMetadataActionProps extends IProposalActionComponentProps<IProposalActionData> {}

const nameMaxLength = 40;
const keyMaxLength = 5;
const summaryMaxLength = 480;

export const UpdatePluginMetadataAction: React.FC<IUpdatePluginMetadataActionProps> = (props) => {
    const { index, action } = props;

    const { t } = useTranslations();

    const actionFieldName = `actions.[${index.toString()}]`;
    useFormField<Record<string, IProposalActionData>, typeof actionFieldName>(actionFieldName);

    const nameField = useFormField<IUpdateMetadataFormData, 'name'>('name', {
        label: 'name label',
        rules: { required: true, maxLength: nameMaxLength },
        trimOnBlur: true,
        defaultValue: '',
    });

    const keyField = useFormField<IUpdateMetadataFormData, 'key'>('key', {
        label: 'key label',
        rules: { required: true, maxLength: keyMaxLength },
        trimOnBlur: true,
        defaultValue: '',
    });

    const summaryField = useFormField<IUpdateMetadataFormData, 'summary'>('summary', {
        label: 'Summary label',
        rules: { maxLength: summaryMaxLength },
        trimOnBlur: true,
        defaultValue: '',
    });

    useEffect(() => {
        console.log(action);
    }, [action]);

    return (
        <div className="flex w-full flex-col gap-y-6">
            <InputText
                helpText={t('nameHelpText')}
                placeholder={t('namePlaceholder')}
                maxLength={nameMaxLength}
                {...nameField}
            />
            <InputText
                helpText={t('keyHelpText')}
                placeholder={t('keyPlaceholder')}
                maxLength={keyMaxLength}
                {...keyField}
            />
            <TextArea
                helpText={t('summaryHelpText')}
                placeholder={t('summaryPlaceholder')}
                maxLength={summaryMaxLength}
                isOptional={true}
                {...summaryField}
            />
            <ResourcesInput
                name="resources"
                fieldPrefix={`${actionFieldName}.resources`}
                helpText={t('app.createDao.createDaoForm.metadata.resources.helpText')}
            />
        </div>
    );
};
