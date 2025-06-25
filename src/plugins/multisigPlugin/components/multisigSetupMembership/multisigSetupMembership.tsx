'use client';

import { AddressesInput } from '@/shared/components/forms/addressesInput';
import { useTranslations } from '@/shared/components/translationsProvider';
import { useWatch } from 'react-hook-form';
import { MultisigSetupMembershipItem } from './components/multisigSetupMembershipItem';
import type { IMultisigSetupMembershipForm, IMultisigSetupMembershipProps } from './multisigSetupMembership.api';

export const MultisigSetupMembership: React.FC<IMultisigSetupMembershipProps> = (props) => {
    const { formPrefix, disabled, onAddClick, pluginAddress, hideLabel, network } = props;

    const { t } = useTranslations();

    const watchMembersField = useWatch<Record<string, IMultisigSetupMembershipForm['members']>>({
        name: `${formPrefix}.members`,
    });

    return (
        <AddressesInput.Container
            name={`${formPrefix}.members`}
            onAddClick={onAddClick}
            label={!hideLabel ? t('app.plugins.multisig.multisigSetupMembership.label') : undefined}
            helpText={!hideLabel ? t('app.plugins.multisig.multisigSetupMembership.helpText') : undefined}
        >
            {watchMembersField.map((_, index) => (
                <MultisigSetupMembershipItem
                    key={index}
                    index={index}
                    disabled={disabled}
                    member={watchMembersField[index]}
                    pluginAddress={pluginAddress}
                    network={network}
                />
            ))}
        </AddressesInput.Container>
    );
};
