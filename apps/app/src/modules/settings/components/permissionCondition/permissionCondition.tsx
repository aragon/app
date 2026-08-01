'use client';

import type { IDaoPermission, Network } from '@/shared/api/daoService';
import { PluginSingleComponent } from '@/shared/components/pluginSingleComponent';
import { SettingsSlotId } from '../../constants/moduleSlots';
import { conditionTypeUtils } from '../../utils/conditionTypeUtils';
import { UnrecognizedConditionSlot } from '../unrecognizedConditionSlot';

export interface IPermissionConditionProps {
    chainId?: number;
    network?: Network;
    row: IDaoPermission;
}

export const PermissionCondition: React.FC<IPermissionConditionProps> = ({
    chainId,
    network,
    row,
}) => {
    const { address, type } = conditionTypeUtils.resolveConditionDisplay(row);

    return (
        <PluginSingleComponent
            chainId={chainId}
            conditionAddress={address}
            Fallback={UnrecognizedConditionSlot}
            network={network}
            pluginAddress={row.whoAddress}
            pluginId={type}
            slotId={SettingsSlotId.SETTINGS_PERMISSION_CONDITION}
            {...row.condition}
        />
    );
};
