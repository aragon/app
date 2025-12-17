'use client';

import { useWatch } from 'react-hook-form';
import { useDao } from '@/shared/api/daoService';
import { AddressesInput } from '@/shared/components/forms/addressesInput';
import { useTranslations } from '@/shared/components/translationsProvider';
import { MultisigSetupMembershipItem } from './components/multisigSetupMembershipItem';
import type { IMultisigSetupMembershipForm, IMultisigSetupMembershipProps } from './multisigSetupMembership.api';

export const MultisigSetupMembership: React.FC<IMultisigSetupMembershipProps> = (props) => {
    const { formPrefix, disabled, onAddClick, pluginAddress, hideLabel, network, daoId } = props;

    const { t } = useTranslations();
    const { data: dao } = useDao({ urlParams: { id: daoId ?? '' } }, { enabled: daoId != null });
    const membershipNetwork = network ?? dao?.network;

    const watchMembersField = useWatch<Record<string, IMultisigSetupMembershipForm['members']>>({
        name: `${formPrefix}.members`,
        defaultValue: [],
    });

    return (
        <AddressesInput.Container
            helpText={hideLabel ? undefined : t('app.plugins.multisig.multisigSetupMembership.helpText')}
            label={hideLabel ? undefined : t('app.plugins.multisig.multisigSetupMembership.label')}
            name={`${formPrefix}.members`}
            onAddClick={onAddClick}
        >
            {watchMembersField.map((memberField, index) => (
                <MultisigSetupMembershipItem
                    disabled={disabled}
                    index={index}
                    key={memberField?.address ?? index}
                    member={watchMembersField[index]}
                    network={membershipNetwork}
                    pluginAddress={pluginAddress}
                />
            ))}
        </AddressesInput.Container>
    );
};
