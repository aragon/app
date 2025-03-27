import type { ITokenSetupMembershipForm } from '@/plugins/tokenPlugin/components/tokenSetupMembership';
import { useTranslations } from '@/shared/components/translationsProvider';
import { useFormField } from '@/shared/hooks/useFormField';
import { Button, IconType, InputContainer, InputText } from '@aragon/gov-ui-kit';
import { useFieldArray } from 'react-hook-form';
import { TokenSetupMemberhipCreateTokenMember } from './tokenSetupMemberhipCreateTokenMember';

export interface ITokenSetupMembershipCreateTokenProps {
    /**
     * Prefix to be appended to all form fields.
     */
    formPrefix: string;
}

export const TokenSetupMembershipCreateToken: React.FC<ITokenSetupMembershipCreateTokenProps> = (props) => {
    const { formPrefix } = props;

    const { t } = useTranslations();

    const tokenNameField = useFormField<ITokenSetupMembershipForm, 'tokenName'>('tokenName', {
        label: t('app.plugins.token.tokenSetupMembership.createToken.name.label'),
        defaultValue: '',
        trimOnBlur: true,
        fieldPrefix: formPrefix,
        rules: {
            required: true,
        },
    });

    const tokenSymbolField = useFormField<ITokenSetupMembershipForm, 'tokenSymbol'>('tokenSymbol', {
        label: t('app.plugins.token.tokenSetupMembership.createToken.symbol.label'),
        defaultValue: '',
        trimOnBlur: true,
        fieldPrefix: formPrefix,
        rules: {
            maxLength: { value: 10, message: t('app.plugins.token.tokenSetupMembership.createToken.symbol.maxLength') },
            required: true,
            validate: (value) =>
                /^[A-Za-z]+$/.test(value ?? '') ||
                t('app.plugins.token.tokenSetupMembership.createToken.symbol.onlyLetters'),
        },
    });

    const { fields, append, remove } = useFieldArray<Record<string, ITokenSetupMembershipForm['members']>>({
        name: `${formPrefix}.members`,
    });

    const handleAddMember = () => append({ address: '', tokenAmount: 1 });

    return (
        <>
            <InputText
                helpText={t('app.plugins.token.tokenSetupMembership.createToken.name.helpText')}
                {...tokenNameField}
            />
            <InputText
                helpText={t('app.plugins.token.tokenSetupMembership.createToken.symbol.helpText')}
                {...tokenSymbolField}
            />
            <InputContainer id="distribute" useCustomWrapper={true}>
                {fields.map((field, index) => (
                    <TokenSetupMemberhipCreateTokenMember
                        key={field.id}
                        fieldNamePrefix={formPrefix}
                        index={index}
                        initialValue={field.address}
                        onRemoveMember={remove}
                        canRemove={fields.length > 1}
                    />
                ))}
            </InputContainer>
            <div className="flex w-full justify-between">
                <Button size="md" variant="secondary" iconLeft={IconType.PLUS} onClick={handleAddMember}>
                    {t('app.plugins.token.tokenSetupMembership.createToken.add')}
                </Button>
            </div>
        </>
    );
};
