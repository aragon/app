import type { ProcessInputItemBaseForm } from '@/modules/governance/components/createProcessForm/createProcessFormDefinitions';
import { useFormField } from '@/shared/hooks/useFormField';

export const useProcessFields = (stageName: string) => {
    const basePath = `${stageName}` as const;

    const nameField = useFormField<ProcessInputItemBaseForm, `${typeof stageName}.name`>(`${basePath}.name`, {
        label: 'Name',
        trimOnBlur: true,
        rules: { required: true },
        defaultValue: '',
    });

    const idField = useFormField<ProcessInputItemBaseForm, `${typeof stageName}.id`>(`${basePath}.id`, {
        label: 'ID',
        trimOnBlur: true,
        rules: { required: true },
        defaultValue: '',
    });

    const summaryField = useFormField<ProcessInputItemBaseForm, `${typeof stageName}.summary`>(`${basePath}.summary`, {
        label: 'Summary',
        defaultValue: '',
    });

    return {
        nameField,
        idField,
        summaryField,
    };
};
