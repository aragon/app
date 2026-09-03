'use client';

import { addressUtils, type IDefinitionSetting } from '@aragon/gov-ui-kit';
import { useEnsName } from '@/modules/ens';
import type { IUseGovernanceSettingsParams } from '@/modules/settings/types';
import { useSafeInfo } from '@/shared/api/safeService';
import { useTranslations } from '@/shared/components/translationsProvider';
import { daoUtils } from '@/shared/utils/daoUtils';
import { safeMultisigSettingsUtils } from '../../utils/safeMultisigSettingsUtils';

export const useSafeMultisigGovernanceSettings = (
    params: IUseGovernanceSettingsParams,
): IDefinitionSetting[] => {
    const { daoId, pluginAddress } = params;
    const { t } = useTranslations();
    const { network } = daoUtils.parseDaoId(daoId);
    const { data: safeInfo } = useSafeInfo({
        urlParams: { network, address: pluginAddress },
    });
    const { data: ensName } = useEnsName(pluginAddress);

    if (safeInfo == null) {
        return [];
    }

    return safeMultisigSettingsUtils.parseSettings({
        safeInfo,
        safeName: ensName ?? addressUtils.truncateAddress(pluginAddress),
        safeHref: `/safe/${network}/${addressUtils.getChecksum(pluginAddress)}`,
        t,
    });
};
