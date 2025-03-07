import { useTranslations } from '@/shared/components/translationsProvider';
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
import type { ICreateProcessFormBody } from '../../../createProcessFormDefinitions';
import type { ICreateProcessFormBodyDialogStepsProps } from '../../../createProcessFormStages/fields/stageBodiesField/stageBodiesFieldDefinitions';
import { TokenVotingMemberInputRow } from '../createProcessFormTokenVotingMemberInputRow';

export interface ICreateProcessFormTokenVotingDistroProps extends ICreateProcessFormBodyDialogStepsProps {}

export const CreateProcessFormTokenVotingDistro: React.FC<ICreateProcessFormTokenVotingDistroProps> = (props) => {
    const { fieldPrefix } = props;

    const { t } = useTranslations();
    const keyNamespace = 'app.createDao.createProcessForm.tokenFlow.distro';

    const {
        onChange: onTokenTypeChange,
        value: tokenType,
        ...tokenTypeField
    } = useFormField<ICreateProcessFormBody, 'tokenType'>('tokenType', {
        label: t(`${keyNamespace}.typeLabel`),
        defaultValue: 'new',
        fieldPrefix,
    });

    const {
        onChange: onImportTokenAddressChange,
        value: importTokenAddress,
        ...importTokenAddressField
    } = useFormField<ICreateProcessFormBody, 'importTokenAddress'>('importTokenAddress', {
        label: t(`${keyNamespace}.import.label`),
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
        label: t(`${keyNamespace}.name.label`),
        defaultValue: '',
        trimOnBlur: true,
        fieldPrefix,
        rules: { required: tokenType === 'new' ? t(`${keyNamespace}.name.required`) : false },
    });

    const tokenSymbolField = useFormField<ICreateProcessFormBody, 'tokenSymbol'>('tokenSymbol', {
        label: t(`${keyNamespace}.symbol.label`),
        defaultValue: '',
        trimOnBlur: true,
        fieldPrefix,
        rules: {
            maxLength: { value: 10, message: t(`${keyNamespace}.symbol.maxLength`) },
            required: tokenType === 'new' ? t(`${keyNamespace}.symbol.required`) : false,
            validate:
                tokenType === 'new'
                    ? (value) => /^[A-Za-z]+$/.test(value ?? '') || t(`${keyNamespace}.symbol.onlyLetters`)
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
                helpText={t(`${keyNamespace}.helpText`)}
                useCustomWrapper={true}
                {...tokenTypeField}
            >
                <RadioGroup className="w-full" value={tokenType} onValueChange={onTokenTypeChange}>
                    <div className="flex w-full flex-row gap-x-2">
                        <RadioCard className="w-1/2" label={t(`${keyNamespace}.importExisting`)} value="imported" />
                        <RadioCard className="w-1/2" label={t(`${keyNamespace}.createNeW`)} value="new" />
                    </div>
                </RadioGroup>
            </InputContainer>
            {tokenType === 'imported' && (
                <>
                    <AddressInput
                        placeholder={t(`${keyNamespace}.import.placeholder`)}
                        helpText={t(`${keyNamespace}.import.helpText`)}
                        onAccept={(value) => onImportTokenAddressChange(value?.address)}
                        value={tokenAddressInput}
                        chainId={1}
                        onChange={setTokenAddressInput}
                        {...importTokenAddressField}
                    />
                    <AlertCard
                        message={t(`${keyNamespace}.alert.message`)}
                        description={t(`${keyNamespace}.alert.description`)}
                        variant="warning"
                    />
                </>
            )}
            {tokenType === 'new' && (
                <>
                    <InputText helpText={t(`${keyNamespace}.name.helpText`)} {...tokenNameField} />
                    <InputText helpText={t(`${keyNamespace}.symbol.helpText`)} {...tokenSymbolField} />
                    <InputContainer
                        id="distribute"
                        label={t(`${keyNamespace}.distribute.label`)}
                        helpText={t(`${keyNamespace}.distribute.helpText`)}
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
                            {t(`${keyNamespace}.add`)}
                        </Button>
                    </div>
                </>
            )}
        </>
    );
};
