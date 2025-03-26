import type { ITokenSetupMembershipForm } from '@/modules/createDao/components/createProcessForm/createProcessFormDefinitions';
import { useTranslations } from '@/shared/components/translationsProvider';
import { useFormField } from '@/shared/hooks/useFormField';
import { AddressInput, addressUtils, AlertCard } from '@aragon/gov-ui-kit';
import { useState } from 'react';

export interface ICreateProcessFormTokenVotingImportTokenProps {
    fieldPrefix: string;
}

export const CreateProcessFormTokenVotingImportToken: React.FC<ICreateProcessFormTokenVotingImportTokenProps> = (
    props,
) => {
    const { fieldPrefix } = props;
    const { t } = useTranslations();

    const {
        onChange: onImportTokenAddressChange,
        value: importTokenAddress,
        ...importTokenAddressField
    } = useFormField<ITokenSetupMembershipForm, 'importTokenAddress'>('importTokenAddress', {
        label: t('app.createDao.createProcessForm.tokenFlow.distro.import.label'),
        defaultValue: '',
        trimOnBlur: true,
        fieldPrefix,
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
