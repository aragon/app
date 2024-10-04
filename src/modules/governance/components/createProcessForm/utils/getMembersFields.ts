import { useFieldArray } from 'react-hook-form';

export const getTokenMembersFieldArray = (stageName: string, stageIndex: number, bodyIndex: number) => {
    const tokenMemberFieldArrayName = `${stageName}.${stageIndex}.bodies.${bodyIndex}.tokenMembers`;
    const { fields, append, remove, update } = useFieldArray({ name: tokenMemberFieldArrayName });
    return {
        tokenMemberFields: fields,
        appendTokenMember: append,
        removeTokenMember: remove,
        updateTokenMember: update,
    };
};

export const getMultisigMembersFieldArray = (stageName: string, stageIndex: number, bodyIndex: number) => {
    const multisigMemberFieldArrayName = `${stageName}.${stageIndex}.bodies.${bodyIndex}.multisigMembers`;
    const { fields, append, remove, update } = useFieldArray({ name: multisigMemberFieldArrayName });
    return {
        multisigMemberFields: fields,
        appendMultisigMember: append,
        removeMultisigMember: remove,
        updateMultisigMember: update,
    };
};
