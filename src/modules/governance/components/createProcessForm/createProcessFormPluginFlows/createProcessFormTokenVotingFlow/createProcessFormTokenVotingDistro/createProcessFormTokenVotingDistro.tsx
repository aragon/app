import type { ICreateProcessFormBody } from '@/modules/governance/components/createProcessForm/createProcessFormDefinitions';
import { TokenVotingMemberInputRow } from '@/modules/governance/components/createProcessForm/createProcessFormPluginFlows/createProcessFormTokenVotingFlow/createProcessFormTokenVotingMemberInputRow/tokenVotingMemberInputRow';
import { useFormField } from '@/shared/hooks/useFormField';
import {
    Button,
    type ICompositeAddress,
    IconType,
    InputContainer,
    InputText,
    RadioCard,
    RadioGroup,
} from '@aragon/gov-ui-kit';
import type React from 'react';
import { useFieldArray } from 'react-hook-form';
import type { ICreateProcessFormBodyDialogStepsProps } from '../../../createProcessFormStages/fields/stageBodiesField/stageBodiesFieldDefinitions';

export interface ICreateProcessFormTokenVotingDistroProps extends ICreateProcessFormBodyDialogStepsProps {}

export const CreateProcessFormTokenVotingDistro: React.FC<ICreateProcessFormTokenVotingDistroProps> = (props) => {
    const { fieldPrefix } = props;

    const tokenNameField = useFormField<ICreateProcessFormBody, 'tokenName'>('tokenName', {
        label: 'Token Name',
        defaultValue: '',
        trimOnBlur: true,
        fieldPrefix,
        rules: { required: 'Token name is required' },
    });

    const tokenSymbolField = useFormField<ICreateProcessFormBody, 'tokenSymbol'>('tokenSymbol', {
        label: 'Token Symbol',
        defaultValue: '',
        trimOnBlur: true,
        fieldPrefix,
        rules: {
            maxLength: { value: 10, message: 'Symbol cannot exceed 10 characters' },
            required: 'Token symbol is required',
            validate: (value) => /^[A-Za-z]+$/.test(value) || 'Only letters are allowed',
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
                label="ERC-20 token"
                helpText="Import or create a new ERC-20 token, which is used for this Token Voting plugin"
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
    );
};
