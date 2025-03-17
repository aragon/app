import { useTranslations } from '@/shared/components/translationsProvider';
import { useFormField } from '@/shared/hooks/useFormField';
import {
    AddressInput,
    addressUtils,
    AlertCard,
    Button,
    type ICompositeAddress,
    Icon,
    IconType,
    InputContainer,
    InputText,
    Link,
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

    const {
        onChange: onTokenTypeChange,
        value: tokenType,
        ...tokenTypeField
    } = useFormField<ICreateProcessFormBody, 'tokenType'>('tokenType', {
        label: t('app.createDao.createProcessForm.tokenFlow.distro.typeLabel'),
        defaultValue: 'imported',
        fieldPrefix,
    });

    const {
        onChange: onImportTokenAddressChange,
        value: importTokenAddress,
        ...importTokenAddressField
    } = useFormField<ICreateProcessFormBody, 'importTokenAddress'>('importTokenAddress', {
        label: t('app.createDao.createProcessForm.tokenFlow.distro.import.label'),
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
        label: t('app.createDao.createProcessForm.tokenFlow.distro.name.label'),
        defaultValue: '',
        trimOnBlur: true,
        fieldPrefix,
        rules: {
            required: tokenType === 'new' ? t('app.createDao.createProcessForm.tokenFlow.distro.name.required') : false,
        },
    });

    const tokenSymbolField = useFormField<ICreateProcessFormBody, 'tokenSymbol'>('tokenSymbol', {
        label: t('app.createDao.createProcessForm.tokenFlow.distro.symbol.label'),
        defaultValue: '',
        trimOnBlur: true,
        fieldPrefix,
        rules: {
            maxLength: { value: 10, message: t('app.createDao.createProcessForm.tokenFlow.distro.symbol.maxLength') },
            required:
                tokenType === 'new' ? t('app.createDao.createProcessForm.tokenFlow.distro.symbol.required') : false,
            validate:
                tokenType === 'new'
                    ? (value) =>
                          /^[A-Za-z]+$/.test(value ?? '') ||
                          t('app.createDao.createProcessForm.tokenFlow.distro.symbol.onlyLetters')
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
                helpText={t('app.createDao.createProcessForm.tokenFlow.distro.helpText')}
                useCustomWrapper={true}
                {...tokenTypeField}
            >
                <RadioGroup className="w-full" value={tokenType} onValueChange={onTokenTypeChange}>
                    <div className="flex w-full flex-row gap-x-2">
                        <RadioCard
                            className="w-1/2"
                            label={t('app.createDao.createProcessForm.tokenFlow.distro.createCardLabel')}
                            value="new"
                        />
                        <RadioCard
                            className="w-1/2"
                            label={t('app.createDao.createProcessForm.tokenFlow.distro.importCardLabel')}
                            value="imported"
                            disabled={process.env.NEXT_PUBLIC_FEATURE_DISABLE_TOKEN_IMPORT === 'true'}
                        />
                    </div>
                    {process.env.NEXT_PUBLIC_FEATURE_DISABLE_TOKEN_IMPORT === 'true' && (
                        <div className="flex flex-row items-baseline gap-x-2">
                            <Icon icon={IconType.WARNING} size="sm" className="text-info-500" />
                            <div className="flex flex-col gap-y-1">
                                <p className="text-sm text-neutral-400">
                                    {t('app.createDao.createProcessForm.tokenFlow.distro.importDisabled')}{' '}
                                </p>
                                <Link
                                    href="https://app-legacy.aragon.org/"
                                    target="_blank"
                                    iconRight={IconType.LINK_EXTERNAL}
                                    className="text-sm"
                                >
                                    <span className="text-sm">
                                        {t('app.createDao.createProcessForm.tokenFlow.distro.importDisabledLink')}
                                    </span>
                                </Link>
                            </div>
                        </div>
                    )}
                </RadioGroup>
            </InputContainer>
            {tokenType === 'imported' && (
                <>
                    <AddressInput
                        placeholder={t('app.createDao.createProcessForm.tokenFlow.distro.import.placeholder')}
                        helpText={t('app.createDao.createProcessForm.tokenFlow.distro.import.helpText')}
                        onAccept={(value) => onImportTokenAddressChange(value?.address)}
                        value={tokenAddressInput}
                        chainId={1}
                        onChange={setTokenAddressInput}
                        {...importTokenAddressField}
                    />
                    <AlertCard
                        message={t('app.createDao.createProcessForm.tokenFlow.distro.alert.message')}
                        description={t('app.createDao.createProcessForm.tokenFlow.distro.alert.description')}
                        variant="warning"
                    />
                </>
            )}
            {tokenType === 'new' && (
                <>
                    <InputText
                        helpText={t('app.createDao.createProcessForm.tokenFlow.distro.name.helpText')}
                        {...tokenNameField}
                    />
                    <InputText
                        helpText={t('app.createDao.createProcessForm.tokenFlow.distro.symbol.helpText')}
                        {...tokenSymbolField}
                    />
                    <InputContainer id="distribute" useCustomWrapper={true}>
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
                            {t('app.createDao.createProcessForm.tokenFlow.distro.add')}
                        </Button>
                    </div>
                </>
            )}
        </>
    );
};
