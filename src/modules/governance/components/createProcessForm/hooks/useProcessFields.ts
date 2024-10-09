import type { ProcessInputItemBaseForm } from '@/modules/governance/components/createProcessForm/createProcessFormDefinitions';
import { useTranslations } from '@/shared/components/translationsProvider';
import { useFormField } from '@/shared/hooks/useFormField';

export const useProcessFields = (stageName: string) => {
    const basePath = `${stageName}` as const;

    const { t } = useTranslations();

    const nameField = useFormField<ProcessInputItemBaseForm, `${typeof stageName}.name`>(`${basePath}.name`, {
        label: t('app.governance.createProcessForm.process.name.label'),
        trimOnBlur: true,
        rules: { required: true },
        defaultValue: '',
    });

    const keyField = useFormField<ProcessInputItemBaseForm, `${typeof stageName}.key`>(`${basePath}.key`, {
        label: t('app.governance.createProcessForm.process.key.label'),
        trimOnBlur: true,
        rules: {
            required: 'Process key is required',
            pattern: {
                value: /^[A-Z]+$/,
                message: 'Only alphabetic characters are allowed',
            },
        },
        defaultValue: '',
    });

    const summaryField = useFormField<ProcessInputItemBaseForm, `${typeof stageName}.summary`>(`${basePath}.summary`, {
        label: t('app.governance.createProcessForm.process.summary.label'),
        defaultValue: '',
    });

    return {
        nameField,
        keyField,
        summaryField,
    };
};
