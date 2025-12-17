import { Button, IconType, InputContainer, InputText } from '@aragon/gov-ui-kit';
import { type ChangeEvent, useEffect } from 'react';
import { useFieldArray, useFormContext, useWatch } from 'react-hook-form';
import { parseUnits } from 'viem';
import type { ITokenSetupMembershipForm } from '@/plugins/tokenPlugin/components/tokenSetupMembership';
import { useTranslations } from '@/shared/components/translationsProvider';
import { useDaoChain } from '@/shared/hooks/useDaoChain';
import { useFormField } from '@/shared/hooks/useFormField';
import { sanitizePlainText } from '@/shared/security';
import { defaultTokenAddress, defaultTokenDecimals } from '../../constants/tokenDefaults';
import { TokenSetupMembershipCreateTokenMember } from './tokenSetupMembershipCreateTokenMember';

export interface ITokenSetupMembershipCreateTokenProps {
    /**
     * Prefix to be appended to all form fields.
     */
    formPrefix: string;
    /**
     * ID of the DAO.
     */
    daoId: string;
}

const nameMaxLength = 40;
const symbolMaxLength = 12;
// Only allow symbols that start with a letter, followed by letters or numbers
const symbolRegex = /^[A-Z][A-Z0-9]*$/;

export const TokenSetupMembershipCreateToken: React.FC<ITokenSetupMembershipCreateTokenProps> = (props) => {
    const { formPrefix, daoId } = props;

    const { t } = useTranslations();
    const { setValue } = useFormContext();
    const { chainId } = useDaoChain({ daoId });

    const tokenFormPrefix = `${formPrefix}.token`;

    // Those are to ensure that right address and decimals are populated when opening for the first time.
    // `handleTokenTypeChange` handles the state update when switching between token types.
    useFormField<ITokenSetupMembershipForm['token'], 'address'>('address', {
        defaultValue: defaultTokenAddress,
        fieldPrefix: tokenFormPrefix,
    });
    useFormField<ITokenSetupMembershipForm['token'], 'decimals'>('decimals', {
        defaultValue: defaultTokenDecimals,
        fieldPrefix: tokenFormPrefix,
    });

    const nameField = useFormField<ITokenSetupMembershipForm['token'], 'name'>('name', {
        label: t('app.plugins.token.tokenSetupMembership.createToken.name.label'),
        defaultValue: '',
        trimOnBlur: true,
        fieldPrefix: tokenFormPrefix,
        rules: { required: true },
    });

    const { onChange: onSymbolChange, ...symbolField } = useFormField<ITokenSetupMembershipForm['token'], 'symbol'>('symbol', {
        label: t('app.plugins.token.tokenSetupMembership.createToken.symbol.label'),
        defaultValue: '',
        trimOnBlur: true,
        fieldPrefix: tokenFormPrefix,
        rules: {
            required: true,
            pattern: symbolRegex,
        },
    });

    const handleSymbolChange = (event: ChangeEvent<HTMLInputElement>) => {
        onSymbolChange(sanitizePlainText(event.target.value).toUpperCase());
    };

    const membersFieldName = `${formPrefix}.members`;
    const {
        fields: membersField,
        append: addMember,
        remove: removeMember,
    } = useFieldArray<Record<string, ITokenSetupMembershipForm['members']>>({
        name: membersFieldName,
    });
    const watchMembersField = useWatch<Record<string, ITokenSetupMembershipForm['members']>>({
        name: membersFieldName,
    });
    const controlledMembersField = membersField.map((field, index) => ({
        ...field,
        ...watchMembersField[index],
    }));

    const handleAddMember = () => addMember({ address: '', tokenAmount: 1 });

    useEffect(() => {
        const totalSupply = controlledMembersField.reduce((current, member) => current + Number(member.tokenAmount ?? 0), 0);
        const totalSupplyWei = parseUnits(totalSupply.toString(), defaultTokenDecimals);
        setValue(`${tokenFormPrefix}.totalSupply`, totalSupplyWei.toString());
    }, [controlledMembersField, setValue, tokenFormPrefix]);

    return (
        <>
            <InputText
                helpText={t('app.plugins.token.tokenSetupMembership.createToken.name.helpText')}
                maxLength={nameMaxLength}
                {...nameField}
            />
            <InputText
                helpText={t('app.plugins.token.tokenSetupMembership.createToken.symbol.helpText')}
                maxLength={symbolMaxLength}
                onChange={handleSymbolChange}
                {...symbolField}
            />
            <InputContainer
                helpText={t('app.plugins.token.tokenSetupMembership.createToken.distribute.helpText')}
                id="distribute"
                label={t('app.plugins.token.tokenSetupMembership.createToken.distribute.label')}
                useCustomWrapper={true}
            >
                {membersField.map((member, index) => (
                    <TokenSetupMembershipCreateTokenMember
                        chainId={chainId}
                        formPrefix={`${membersFieldName}.${index.toString()}`}
                        index={index}
                        initialValue={member.address}
                        key={member.id}
                        members={controlledMembersField}
                        onRemove={membersField.length > 1 ? () => removeMember(index) : undefined}
                    />
                ))}
            </InputContainer>
            <div className="flex w-full justify-between">
                <Button iconLeft={IconType.PLUS} onClick={handleAddMember} size="md" variant="secondary">
                    {t('app.plugins.token.tokenSetupMembership.createToken.member.action.add')}
                </Button>
            </div>
        </>
    );
};
