'use client';

import { SafeSettingsDetails } from '@/modules/safe/components/safeSettingsDetails';
import type { IDaoPlugInfoProps } from '@/modules/settings/components/daoPluginInfo';
import { daoUtils } from '@/shared/utils/daoUtils';

/**
 * Safe implementation of the plugin-info slot: renders the live settings of the Safe body.
 */
export const SafePluginInfo: React.FC<IDaoPlugInfoProps> = (props) => {
    const { daoId, plugin } = props;

    const { network } = daoUtils.parseDaoId(daoId);

    return <SafeSettingsDetails address={plugin.address} network={network} />;
};
