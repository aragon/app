import { TokenVotingMemberInputRow } from '@/modules/governance/components/createProcessForm/createProcessFormPluginFlows/createProcessFormTokenVotingFlow/createProcessFormTokenVotingMemberInputRow/tokenVotingMemberInputRow';
import { getTokenMembersFieldArray } from '@/modules/governance/components/createProcessForm/utils/getMembersFields';
import { Button, IconType, InputContainer, InputText } from '@aragon/ods';
import React, { useEffect } from 'react';
import { Controller, useFormContext } from 'react-hook-form';

interface TokenMember {
    address: string;
    tokenAmount: number;
}

interface CreateProcessFormTokenVotingDetailsProps {
    stageName: string;
    stageIndex: number;
    bodyIndex: number;
}

export const CreateProcessFormTokenVotingDetails: React.FC<CreateProcessFormTokenVotingDetailsProps> = ({
    stageName,
    stageIndex,
    bodyIndex,
}) => {
    const { watch, control } = useFormContext();
    const tokenSymbol = watch(`${stageName}.${stageIndex}.bodies.${bodyIndex}.tokenSymbol`);

    const { tokenMemberFields, appendTokenMember, removeTokenMember } = getTokenMembersFieldArray(
        stageName,
        stageIndex,
        bodyIndex,
    );

    const handleAddMember = () => {
        appendTokenMember({ address: '', tokenAmount: 1 });
    };

    const handleRemoveMember = (index: number) => {
        if (tokenMemberFields.length > 1) {
            removeTokenMember(index);
        }
    };

    useEffect(() => {
        if (tokenMemberFields.length === 0) {
            handleAddMember();
        }
    });

    return (
        <>
            <Controller
                name={`${stageName}.${stageIndex}.bodies.${bodyIndex}.tokenName`}
                control={control}
                render={({ field }) => (
                    <InputText
                        {...field}
                        placeholder="Enter a name"
                        helpText="The full name of the token. For example: Uniswap"
                    />
                )}
            />

            <Controller
                name={`${stageName}.${stageIndex}.bodies.${bodyIndex}.tokenSymbol`}
                control={control}
                render={({ field }) => (
                    <InputText
                        {...field}
                        maxLength={10}
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
                {tokenMemberFields.map((field, index) => (
                    <TokenVotingMemberInputRow
                        key={field.id}
                        index={index}
                        fieldNamePrefix={`${stageName}.${stageIndex}.bodies.${bodyIndex}.members.${index}`}
                        tokenSymbol={tokenSymbol}
                        handleRemoveMember={() => handleRemoveMember(index)}
                        canRemove={tokenMemberFields.length > 1}
                    />
                ))}
            </InputContainer>

            <div className="flex w-full justify-between">
                <Button size="md" variant="tertiary" iconLeft={IconType.PLUS} onClick={handleAddMember}>
                    Add
                </Button>
            </div>
        </>
    );
};
