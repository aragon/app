import { useFormField } from '@/shared/hooks/useFormField';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type BodyInputItemBaseForm = Record<string, any>;

interface BodyFields {
    bodyNameField: ReturnType<typeof useFormField>;
    bodyGovernanceTypeField: ReturnType<typeof useFormField>;
    tokenNameField: ReturnType<typeof useFormField>;
    tokenSymbolField: ReturnType<typeof useFormField>;
    supportThresholdField: ReturnType<typeof useFormField>;
    minimumParticipationField: ReturnType<typeof useFormField>;
    voteChangeField: ReturnType<typeof useFormField>;
    multisigThresholdField: ReturnType<typeof useFormField>;
}

export const useBodyFields = (stageName: string, stageIndex: number, bodyIndex: number): BodyFields => {
    const basePath = `${stageName}.${stageIndex}.bodies.${bodyIndex}` as const;

    const bodyNameField = useFormField<
        BodyInputItemBaseForm,
        `${typeof stageName}.${typeof stageIndex}.bodies.${typeof bodyIndex}.bodyNameField`
    >(`${basePath}.bodyNameField`, {
        label: 'Name',
        defaultValue: '',
        trimOnBlur: true,
        rules: { required: true },
    });

    const bodyGovernanceTypeField = useFormField<
        BodyInputItemBaseForm,
        `${typeof stageName}.${typeof stageIndex}.bodies.${typeof bodyIndex}.bodyGovernanceTypeField`
    >(`${basePath}.bodyGovernanceTypeField`, {
        label: 'Governance type',
        defaultValue: 'tokenVoting',
    });

    const tokenNameField = useFormField<
        BodyInputItemBaseForm,
        `${typeof stageName}.${typeof stageIndex}.bodies.${typeof bodyIndex}.tokenNameField`
    >(`${basePath}.tokenNameField`, {
        label: 'Name',
        defaultValue: '',
        rules: { required: true },
    });

    const tokenSymbolField = useFormField<
        BodyInputItemBaseForm,
        `${typeof stageName}.${typeof stageIndex}.bodies.${typeof bodyIndex}.tokenSymbolField`
    >(`${basePath}.tokenSymbolField`, {
        label: 'Symbol',
        defaultValue: '',
        rules: {
            maxLength: 10,
            required: true,
            validate: (value) => /^[A-Za-z]+$/.test(value) || 'Only letters are allowed',
        },
    });

    const supportThresholdField = useFormField<
        BodyInputItemBaseForm,
        `${typeof stageName}.${typeof stageIndex}.bodies.${typeof bodyIndex}.supportThresholdField`
    >(`${basePath}.supportThresholdField`, {
        label: 'Support threshold',
        defaultValue: 50,
    });

    const minimumParticipationField = useFormField<
        BodyInputItemBaseForm,
        `${typeof stageName}.${typeof stageIndex}.bodies.${typeof bodyIndex}.minimumParticipationField`
    >(`${basePath}.minimumParticipationField`, {
        label: 'Minimum participation',
        defaultValue: 50,
    });

    const voteChangeField = useFormField<
        BodyInputItemBaseForm,
        `${typeof stageName}.${typeof stageIndex}.bodies.${typeof bodyIndex}.voteChangeField`
    >(`${basePath}.voteChangeField`, {
        label: 'Vote change',
        defaultValue: false,
    });

    const multisigThresholdField = useFormField<
        BodyInputItemBaseForm,
        `${typeof stageName}.${typeof stageIndex}.bodies.${typeof bodyIndex}.multisigThresholdField`
    >(`${basePath}.multisigThresholdField`, {
        label: 'Approval Threshold',
        defaultValue: 1,
        rules: {
            min: {
                value: 1,
                message: 'Threshold must be at least 1',
            },
        },
    });

    return {
        bodyNameField,
        bodyGovernanceTypeField,
        tokenNameField,
        tokenSymbolField,
        supportThresholdField,
        minimumParticipationField,
        voteChangeField,
        multisigThresholdField,
    };
};
