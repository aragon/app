import { type IProposalActionData } from '@/modules/governance/components/createProposalForm';
import { ResourcesInput } from '@/shared/components/forms/resourcesInput';
import { useTranslations } from '@/shared/components/translationsProvider';
import { useFormField } from '@/shared/hooks/useFormField';
import { InputText, TextArea } from '@aragon/gov-ui-kit';
import { useEffect } from 'react';
import type { IUpdateMetadataFormData } from './updateMetadataFormDefinitions';
import { type IDaoPlugin } from '@/shared/api/daoService';
import { type IProposalAction } from '@/modules/governance/api/governanceService';

export interface IUpdatePluginMetadataActionProps {
    action: IProposalActionData<IProposalAction, IDaoPlugin>;
    index: number;
}

const nameMaxLength = 40;
const keyMaxLength = 5;
const summaryMaxLength = 480;

export const UpdatePluginMetadataAction: React.FC<IUpdatePluginMetadataActionProps> = (props) => {
    const { index, action } = props;

    const { meta } = action;

    const { isProcess } = meta;

    const { t } = useTranslations();

    const actionFieldName = `actions.[${index.toString()}]`;
    useFormField<Record<string, IProposalActionData>, typeof actionFieldName>(actionFieldName);

    const nameField = useFormField<IUpdateMetadataFormData, 'name'>('name', {
        label: t('app.governance.updatePluginMetadataAction.nameField.label'),
        fieldPrefix: `${actionFieldName}.proposedMetadata`,
        rules: { required: true, maxLength: nameMaxLength },
        trimOnBlur: true,
        defaultValue: '',
    });

    const keyField = useFormField<IUpdateMetadataFormData, 'key'>('key', {
        label: t('app.governance.updatePluginMetadataAction.keyField.label'),
        fieldPrefix: `${actionFieldName}.proposedMetadata`,
        rules: { required: true, maxLength: keyMaxLength },
        trimOnBlur: true,
        defaultValue: '',
    });

    const summaryField = useFormField<IUpdateMetadataFormData, 'summary'>('summary', {
        label: t('app.governance.updatePluginMetadataAction.summaryField.label'),
        fieldPrefix: `${actionFieldName}.proposedMetadata`,
        rules: { maxLength: summaryMaxLength },
        trimOnBlur: true,
        defaultValue: '',
    });

    useEffect(() => {
        console.log('ACTION =>', action);
    }, [action]);

    return (
        <div className="flex w-full flex-col gap-y-6">
            <InputText
                helpText={t('app.governance.updatePluginMetadataAction.nameField.helpText')}
                placeholder={t('app.governance.updatePluginMetadataAction.nameField.placeholder')}
                maxLength={nameMaxLength}
                {...nameField}
            />
            {isProcess && (
                <InputText
                    helpText={t('app.governance.updatePluginMetadataAction.keyField.helpText')}
                    placeholder={t('app.governance.updatePluginMetadataAction.keyField.placeholder')}
                    maxLength={keyMaxLength}
                    {...keyField}
                />
            )}
            <TextArea
                helpText={t('app.governance.updatePluginMetadataAction.summaryField.helpText')}
                placeholder={t('app.governance.updatePluginMetadataAction.summaryField.placeholder')}
                maxLength={summaryMaxLength}
                isOptional={true}
                {...summaryField}
            />
            <ResourcesInput
                name="resources"
                fieldPrefix={`${actionFieldName}.proposedMetadata.resources`}
                helpText={t('app.createDao.createDaoForm.metadata.resources.helpText')}
            />
        </div>
    );
};
