import type { ICreateProcessFormBodyNameProps } from '@/modules/governance/components/createProcessForm/createProcessFormDefinitions';
import { TokenVotingMemberInputRow } from '@/modules/governance/components/createProcessForm/createProcessFormPluginFlows/createProcessFormTokenVotingFlow/createProcessFormTokenVotingMemberInputRow/tokenVotingMemberInputRow';
import { useMembersFieldArray } from '@/modules/governance/components/createProcessForm/hooks/useMembersFieldArray';
import { Button, IconType, InputContainer, InputText, RadioCard, RadioGroup } from '@aragon/ods';
import type React from 'react';
import { Controller, useFormContext } from 'react-hook-form';

export interface ICreateProcessFormTokenVotingDetailsProps extends ICreateProcessFormBodyNameProps {}

export const CreateProcessFormTokenVotingDetails: React.FC<ICreateProcessFormTokenVotingDetailsProps> = (props) => {
    const { stageName, stageIndex, bodyIndex } = props;
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
            <InputContainer
                id="token"
                label="ERC-20 token"
                helpText="Import or create a new ERC-20 token, which is used for this Token Voting Plugin"
                useCustomWrapper={true}
            >
                <RadioGroup defaultValue="createToken" className="w-full">
                    <div className="flex w-full flex-row gap-x-2">
                        <RadioCard
                            className="w-1/2"
                            label="Import token"
                            description=""
                            value="importToken"
                            disabled={true}
                        />
                        <RadioCard className="w-1/2" label="Create new token" description="" value="createToken" />
                    </div>
                </RadioGroup>
            </InputContainer>
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
