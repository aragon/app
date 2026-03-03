'use client';

import { PluginMembershipInput } from '@/shared/components/forms/pluginMembershipInput/pluginMembershipInput';
import type { IMultisigSetupMembershipProps } from './multisigSetupMembership.api';

export const MultisigSetupMembership: React.FC<
    IMultisigSetupMembershipProps
> = (props) => {
    const {
        formPrefix,
        disabled,
        onAddClick,
        pluginAddress,
        network,
        daoId,
        showResetAllAction,
    } = props;

    return (
        <PluginMembershipInput
            alreadyMemberErrorKey="app.plugins.multisig.multisigSetupMembership.item.alreadyMember"
            daoId={daoId}
            disabled={disabled}
            formPrefix={formPrefix}
            network={network}
            onAddClick={onAddClick}
            pluginAddress={pluginAddress}
            showResetAllAction={showResetAllAction}
            validateMemberExists={true}
        />
    );
};
