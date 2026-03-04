'use client';

import { ManageMembershipAddressList } from '@/shared/components/forms/manageMembershipAddressList';
import { useTranslations } from '@/shared/components/translationsProvider';
import type { IMultisigSetupMembershipProps } from './multisigSetupMembership.api';

export const MultisigSetupMembership: React.FC<
    IMultisigSetupMembershipProps
> = (props) => {
    const {
        formPrefix,
        disabled,
        onAddClick,
        pluginAddress,
        hideLabel,
        network,
        daoId,
        showResetAllAction,
    } = props;

    const { t } = useTranslations();

    return (
        <ManageMembershipAddressList
            alreadyMemberErrorKey="app.plugins.multisig.multisigSetupMembership.item.alreadyMember"
            daoId={daoId}
            disabled={disabled}
            formPrefix={formPrefix}
            helpText={
                hideLabel
                    ? undefined
                    : t('app.plugins.multisig.multisigSetupMembership.helpText')
            }
            label={
                hideLabel
                    ? undefined
                    : t('app.plugins.multisig.multisigSetupMembership.label')
            }
            network={network}
            onAddClick={onAddClick}
            pluginAddress={pluginAddress}
            showResetAllAction={showResetAllAction}
        />
    );
};
