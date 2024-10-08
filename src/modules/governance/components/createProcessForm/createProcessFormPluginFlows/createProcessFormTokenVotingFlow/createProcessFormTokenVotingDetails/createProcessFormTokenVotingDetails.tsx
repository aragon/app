import { TokenVotingMemberInputRow } from '@/modules/governance/components/createProcessForm/createProcessFormPluginFlows/createProcessFormTokenVotingFlow/createProcessFormTokenVotingMemberInputRow/tokenVotingMemberInputRow';
import { useMembersFieldArray } from '@/modules/governance/components/createProcessForm/hooks/useMembersFieldArray';
import { Button, IconType, InputContainer, InputText } from '@aragon/ods';
import type React from 'react';
import { Controller, useFormContext } from 'react-hook-form';

export interface ICreateProcessFormTokenVotingDetailsProps {
    stageName: string;
    stageIndex: number;
    bodyIndex: number;
}

export const CreateProcessFormTokenVotingDetails: React.FC<ICreateProcessFormTokenVotingDetailsProps> = ({
    stageName,
    stageIndex,
    bodyIndex,
}) => {
    const { control } = useFormContext();

    const { membersFieldArray, appendMember, removeMember } = useMembersFieldArray(stageName, stageIndex, bodyIndex);

    const handleAddMember = () => {
        appendMember({ tokenAmount: 1 });
    };

    const handleRemoveMember = (index: number) => {
        if (membersFieldArray.length > 1) {
            removeMember(index);
        }
    };

    return (
        <>
            <Controller
                name={`${stageName}.${stageIndex}.bodies.${bodyIndex}.tokenNameField`}
                control={control}
                render={({ field }) => (
                    <InputText
                        {...field}
                        label="Token name"
                        placeholder="Enter a name"
                        helpText="The full name of the token. For example: Uniswap"
                    />
                )}
            />

            <Controller
                name={`${stageName}.${stageIndex}.bodies.${bodyIndex}.tokenSymbolField`}
                control={control}
                render={({ field }) => (
                    <InputText
                        {...field}
                        value={field.value ? field.value.toUpperCase() : ''}
                        onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                        maxLength={8}
                        label="Token Symbol"
                        placeholder="Enter a symbol"
                        helpText="The abbreviation of the token. For example: UNI"
                    />
                )}
            />

            <InputContainer
                id="distribute"
                label="Distribute Tokens"
                helpText="Add the wallets you'd like to distribute tokens to."
                useCustomWrapper={true}
            >
                {membersFieldArray.map((field, index) => (
                    <TokenVotingMemberInputRow
                        key={field.id}
                        index={index}
                        fieldNamePrefix={`${stageName}.${stageIndex}.bodies.${bodyIndex}.members.${index}`}
                        handleRemoveMember={() => handleRemoveMember(index)}
                        canRemove={membersFieldArray.length > 1}
                    />
                ))}
            </InputContainer>

            <div className="flex w-full justify-between">
                <Button size="md" variant="secondary" iconLeft={IconType.PLUS} onClick={handleAddMember}>
                    Add
                </Button>
            </div>
        </>
    );
};
