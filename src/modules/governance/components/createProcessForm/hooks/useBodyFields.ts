import type {
    BodyInputItemBaseForm,
    IBodyFields,
} from '@/modules/governance/components/createProcessForm/createProcessFormDefinitions';
import { useFormField } from '@/shared/hooks/useFormField';

export const useBodyFields = (stageFieldName: string, bodyIndex: number): IBodyFields => {
    const basePath = `${stageFieldName}.bodies.${bodyIndex}` as const;

    const bodyNameField = useFormField<
        BodyInputItemBaseForm,
        `${typeof stageFieldName}.bodies.${typeof bodyIndex}.bodyNameField`
    >(`${basePath}.bodyNameField`, {
        label: 'Name',
        defaultValue: '',
        trimOnBlur: true,
        rules: { required: true },
    });

    const bodySummaryField = useFormField<
        BodyInputItemBaseForm,
        `${typeof stageFieldName}.bodies.${typeof bodyIndex}.bodySummaryField`
    >(`${basePath}.bodySummaryField`, {
        label: 'Summary',
        defaultValue: '',
    });

    const bodyGovernanceTypeField = useFormField<
        BodyInputItemBaseForm,
        `${typeof stageFieldName}.bodies.${typeof bodyIndex}.bodyGovernanceTypeField`
    >(`${basePath}.bodyGovernanceTypeField`, {
        label: 'Governance type',
        defaultValue: 'tokenVoting',
    });

    const tokenNameField = useFormField<
        BodyInputItemBaseForm,
        `${typeof stageFieldName}.bodies.${typeof bodyIndex}.tokenNameField`
    >(`${basePath}.tokenNameField`, {
        label: 'Name',
        defaultValue: '',
        trimOnBlur: true,
        rules: { required: 'Token name is required' },
    });

    const tokenSymbolField = useFormField<
        BodyInputItemBaseForm,
        `${typeof stageFieldName}.bodies.${typeof bodyIndex}.tokenSymbolField`
    >(`${basePath}.tokenSymbolField`, {
        label: 'Symbol',
        defaultValue: '',
        trimOnBlur: true,
        rules: {
            maxLength: {
                value: 10,
                message: 'Symbol cannot exceed 10 characters',
            },
            required: 'Token symbol is required',
            validate: (value) => /^[A-Za-z]+$/.test(value) || 'Only letters are allowed',
        },
    });

    const supportThresholdField = useFormField<
        BodyInputItemBaseForm,
        `${typeof stageFieldName}.bodies.${typeof bodyIndex}.supportThresholdField`
    >(`${basePath}.supportThresholdField`, {
        label: 'Support threshold',
        defaultValue: 50,
    });

    const minimumParticipationField = useFormField<
        BodyInputItemBaseForm,
        `${typeof stageFieldName}.bodies.${typeof bodyIndex}.minimumParticipationField`
    >(`${basePath}.minimumParticipationField`, {
        label: 'Minimum participation',
        defaultValue: 1,
    });

    const voteChangeField = useFormField<
        BodyInputItemBaseForm,
        `${typeof stageFieldName}.bodies.${typeof bodyIndex}.voteChangeField`
    >(`${basePath}.voteChangeField`, {
        label: 'Vote change',
        defaultValue: false,
    });

    const multisigThresholdField = useFormField<
        BodyInputItemBaseForm,
        `${typeof stageFieldName}.bodies.${typeof bodyIndex}.multisigThresholdField`
    >(`${basePath}.multisigThresholdField`, {
        label: 'Approval Threshold',
        defaultValue: 1,
        rules: {
            required: 'Threshold must be at least 1',
            min: {
                value: 1,
                message: 'Threshold must be at least 1',
            },
        },
    });

    return {
        bodyNameField,
        bodySummaryField,
        bodyGovernanceTypeField,
        tokenNameField,
        tokenSymbolField,
        supportThresholdField,
        minimumParticipationField,
        voteChangeField,
        multisigThresholdField,
    };
};
