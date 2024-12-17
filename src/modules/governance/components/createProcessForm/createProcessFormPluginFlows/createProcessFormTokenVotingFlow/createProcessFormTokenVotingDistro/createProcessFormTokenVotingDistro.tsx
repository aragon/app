import type { ICreateProcessFormBody } from '@/modules/governance/components/createProcessForm/createProcessFormDefinitions';
import { TokenVotingMemberInputRow } from '@/modules/governance/components/createProcessForm/createProcessFormPluginFlows/createProcessFormTokenVotingFlow/createProcessFormTokenVotingMemberInputRow/tokenVotingMemberInputRow';
import { useFormField } from '@/shared/hooks/useFormField';
import {
    AddressInput,
    addressUtils,
    AlertCard,
    Button,
    type ICompositeAddress,
    IconType,
    InputContainer,
    InputText,
    RadioCard,
    RadioGroup,
} from '@aragon/gov-ui-kit';
import type React from 'react';
import { useState } from 'react';
import { useFieldArray } from 'react-hook-form';
import type { ICreateProcessFormBodyDialogStepsProps } from '../../../createProcessFormStages/fields/stageBodiesField/stageBodiesFieldDefinitions';

export interface ICreateProcessFormTokenVotingDistroProps extends ICreateProcessFormBodyDialogStepsProps {}

export const CreateProcessFormTokenVotingDistro: React.FC<ICreateProcessFormTokenVotingDistroProps> = (props) => {
    const { fieldPrefix } = props;

    const {
        onChange: onTokenTypeChange,
        value: tokenType,
        ...tokenTypeField
    } = useFormField<ICreateProcessFormBody, 'tokenType'>('tokenType', {
        label: 'ERC-20 token',
        defaultValue: 'new',
        fieldPrefix,
    });

    const {
        onChange: onImportTokenAddressChange,
        value: importTokenAddress,
        ...importTokenAddressField
    } = useFormField<ICreateProcessFormBody, 'importTokenAddress'>('importTokenAddress', {
        label: 'Token address',
        defaultValue: '',
        trimOnBlur: true,
        fieldPrefix,
        rules: {
            required: tokenType === 'imported' ? true : false,
            validate: tokenType === 'imported' ? (value) => addressUtils.isAddress(value) : undefined,
        },
    });

    const [tokenAddressInput, setTokenAddressInput] = useState<string | undefined>(importTokenAddress);

    const tokenNameField = useFormField<ICreateProcessFormBody, 'tokenName'>('tokenName', {
        label: 'Token Name',
        defaultValue: '',
        trimOnBlur: true,
        fieldPrefix,
        rules: { required: tokenType === 'new' ? 'Token name is required' : false },
    });

    const tokenSymbolField = useFormField<ICreateProcessFormBody, 'tokenSymbol'>('tokenSymbol', {
        label: 'Token Symbol',
        defaultValue: '',
        trimOnBlur: true,
        fieldPrefix,
        rules: {
            maxLength: { value: 10, message: 'Symbol cannot exceed 10 characters' },
            required: tokenType === 'new' ? 'Token symbol is required' : false,
            validate:
                tokenType === 'new'
                    ? (value) => /^[A-Za-z]+$/.test(value ?? '') || 'Only letters are allowed'
                    : undefined,
        },
    });

    const { fields, append, remove } = useFieldArray<Record<string, ICreateProcessFormBody['members']>>({
        name: `${fieldPrefix}.members`,
    });

    const handleAddMember = () => append({ address: '', tokenAmount: 1 } as ICompositeAddress);

    return (
        <>
            <InputContainer
                id="token"
                helpText="Import or create a new ERC-20 token, which is used for this Token Voting plugin"
                useCustomWrapper={true}
                {...tokenTypeField}
            >
                <RadioGroup className="w-full" value={tokenType} onValueChange={onTokenTypeChange}>
                    <div className="flex w-full flex-row gap-x-2">
                        <RadioCard className="w-1/2" label="Import token" description="" value="imported" />
                        <RadioCard className="w-1/2" label="Create new token" description="" value="new" />
                    </div>
                </RadioGroup>
            </InputContainer>
            {tokenType === 'imported' && (
                <>
                    <AddressInput
                        placeholder="Enter the token address to import"
                        helpText="The address of the token to be imported"
                        onAccept={(value) => onImportTokenAddressChange(value?.address)}
                        value={tokenAddressInput}
                        chainId={1}
                        onChange={setTokenAddressInput}
                        {...importTokenAddressField}
                    />
                    <AlertCard
                        message="Not all tokens are compatible"
                        description="In order for this body to be able to participate in governance, you must ensure that this token has these exact functions: getPastVotes, getVotes, getPastTotalSupply."
                        variant="warning"
                    />
                </>
            )}
            {tokenType === 'new' && (
                <>
                    <InputText
                        placeholder="Enter a name"
                        helpText="The full name of the token. For example: Uniswap"
                        {...tokenNameField}
                    />
                    <InputText
                        placeholder="Enter a symbol"
                        helpText="The abbreviation of the token. For example: UNI"
                        {...tokenSymbolField}
                    />
                    <InputContainer
                        id="distribute"
                        label="Distribute Tokens"
                        helpText="Add the wallets you'd like to distribute tokens to."
                        useCustomWrapper={true}
                    >
                        {fields.map((field, index) => (
                            <TokenVotingMemberInputRow
                                key={field.id}
                                fieldNamePrefix={fieldPrefix}
                                index={index}
                                initialValue={field.address}
                                onRemoveMember={remove}
                                canRemove={fields.length > 1}
                            />
                        ))}
                    </InputContainer>
                    <div className="flex w-full justify-between">
                        <Button size="md" variant="secondary" iconLeft={IconType.PLUS} onClick={handleAddMember}>
                            Add
                        </Button>
                    </div>
                </>
            )}
        </>
    );
};
