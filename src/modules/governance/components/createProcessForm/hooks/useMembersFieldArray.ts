import { useFieldArray, type UseFieldArrayReturn } from 'react-hook-form';

export interface ITokenVotingMember {
    address: string;
    name?: string;
    tokenAmount: number;
}

export interface IMultisigMember {
    address: string;
    name?: string;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type MemberInputItemBaseForm = Record<string, any>;

interface UseMembersReturn {
    membersFieldArray: MemberInputItemBaseForm[];
    appendMember: UseFieldArrayReturn<MemberInputItemBaseForm>['append'];
    removeMember: UseFieldArrayReturn<MemberInputItemBaseForm>['remove'];
    updateMember: UseFieldArrayReturn<MemberInputItemBaseForm>['update'];
}

export const useMembersFieldArray = (stageName: string, stageIndex: number, bodyIndex: number): UseMembersReturn => {
    const memberFieldArrayName = `${stageName}.${stageIndex}.bodies.${bodyIndex}.members`;

    const { fields, append, remove, update } = useFieldArray<MemberInputItemBaseForm>({
        name: memberFieldArrayName,
    });

    return {
        membersFieldArray: fields,
        appendMember: append,
        removeMember: remove,
        updateMember: update,
    };
};
