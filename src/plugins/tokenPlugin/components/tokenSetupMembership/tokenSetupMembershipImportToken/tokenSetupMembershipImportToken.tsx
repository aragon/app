import type { ITokenSetupMembershipForm } from '@/plugins/tokenPlugin/components/tokenSetupMembership';
import { useTranslations } from '@/shared/components/translationsProvider';
import { useFormField } from '@/shared/hooks/useFormField';
import { AddressInput, addressUtils, AlertCard } from '@aragon/gov-ui-kit';
import { useState } from 'react';

export interface ITokenSetupMembershipImportTokenProps {
    /**
     * Prefix to be appended to all form fields.
     */
    formPrefix: string;
}

export const TokenSetupMembershipImportToken: React.FC<ITokenSetupMembershipImportTokenProps> = (props) => {
    const { formPrefix } = props;

    const { t } = useTranslations();

    const tokenFormPrefix = `${formPrefix}.token`;

    const {
        onChange: onImportTokenAddressChange,
        value: importTokenAddress,
        ...importTokenAddressField
    } = useFormField<ITokenSetupMembershipForm['token'], 'address'>('address', {
        label: t('app.plugins.token.tokenSetupMembership.importToken.label'),
        defaultValue: '',
        trimOnBlur: true,
        fieldPrefix: tokenFormPrefix,
        rules: {
            required: true,
            validate: (value) => addressUtils.isAddress(value),
        },
    });

    const [tokenAddressInput, setTokenAddressInput] = useState<string | undefined>(importTokenAddress);

    return (
        <>
            <AddressInput
                placeholder={t('app.plugins.token.tokenSetupMembership.importToken.placeholder')}
                helpText={t('app.plugins.token.tokenSetupMembership.importToken.helpText')}
                onAccept={(value) => onImportTokenAddressChange(value?.address)}
                value={tokenAddressInput}
                chainId={1}
                onChange={setTokenAddressInput}
                {...importTokenAddressField}
            />
            <AlertCard
                message={t('app.plugins.token.tokenSetupMembership.importToken.alert.message')}
                description={t('app.plugins.token.tokenSetupMembership.importToken.alert.description')}
                variant="warning"
            />
        </>
    );
};
