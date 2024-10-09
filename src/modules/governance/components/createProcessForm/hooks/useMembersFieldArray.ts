import type { ICreateProcessFormBodyNameProps } from '@/modules/governance/components/createProcessForm/createProcessFormDefinitions';
import {
    type FieldArrayPath,
    type FieldArrayWithId,
    type FieldValues,
    useFieldArray,
    type UseFieldArrayReturn,
} from 'react-hook-form';

export type MemberInputItemBaseForm = {
    address?: string;
    tokenAmount?: number;
};

interface UseMembersReturn<
    TFieldValues extends FieldValues,
    TName extends `${string}.${number}.bodies.${number}.members` & FieldArrayPath<TFieldValues>,
> {
    /**
     * The array of member fields, each containing the member data and a unique 'id'.
     */
    membersFieldArray: Array<MemberInputItemBaseForm & FieldArrayWithId<TFieldValues, TName, 'id'>>;
    /**
     * Function to append a new member to the field array.
     */
    appendMember: UseFieldArrayReturn<TFieldValues, TName>['append'];
    /**
     * Function to remove a member from the field array by index.
     */
    removeMember: UseFieldArrayReturn<TFieldValues, TName>['remove'];
    /**
     * Function to update a member's data at a specific index.
     */
    updateMember: UseFieldArrayReturn<TFieldValues, TName>['update'];
}

export const useMembersFieldArray = <
    TFieldValues extends FieldValues,
    TName extends `${string}.${number}.bodies.${number}.members` & FieldArrayPath<TFieldValues>,
>(
    props: ICreateProcessFormBodyNameProps,
): UseMembersReturn<TFieldValues, TName> => {
    const { stageName, stageIndex, bodyIndex } = props;

    const name = `${stageName}.${stageIndex}.bodies.${bodyIndex}.members` as TName;

    const { fields, append, remove, update } = useFieldArray<TFieldValues, TName>({
        name,
    });

    return {
        membersFieldArray: fields as Array<MemberInputItemBaseForm & FieldArrayWithId<TFieldValues, TName, 'id'>>,
        appendMember: append,
        removeMember: remove,
        updateMember: update,
    };
};
