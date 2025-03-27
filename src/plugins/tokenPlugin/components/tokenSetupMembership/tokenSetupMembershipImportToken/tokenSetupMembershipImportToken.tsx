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

    const {
        onChange: onImportTokenAddressChange,
        value: importTokenAddress,
        ...importTokenAddressField
    } = useFormField<ITokenSetupMembershipForm, 'importTokenAddress'>('importTokenAddress', {
        label: t('app.createDao.createProcessForm.tokenFlow.distro.import.label'),
        defaultValue: '',
        trimOnBlur: true,
        fieldPrefix: formPrefix,
        rules: {
            required: true,
            validate: (value) => addressUtils.isAddress(value),
        },
    });

    const [tokenAddressInput, setTokenAddressInput] = useState<string | undefined>(importTokenAddress);

    return (
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
    );
};
