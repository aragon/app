'use client';

import type { IDefinitionSetting } from '@aragon/gov-ui-kit';
import type { IUseGovernanceSettingsParams } from '@/modules/settings/types';
import { useSafeInfo } from '@/shared/api/safeService';
import { useTranslations } from '@/shared/components/translationsProvider';
import { daoUtils } from '@/shared/utils/daoUtils';
import { safeMultisigSettingsUtils } from '../../utils/safeMultisigSettingsUtils';

export const useSafeMultisigGovernanceSettings = (
    params: IUseGovernanceSettingsParams,
): IDefinitionSetting[] => {
    const { daoId, pluginAddress, isVeto } = params;
    const { t } = useTranslations();
    const { network } = daoUtils.parseDaoId(daoId);
    const { data: safeInfo } = useSafeInfo({
        urlParams: { network, address: pluginAddress },
    });

    return safeInfo == null
        ? []
        : safeMultisigSettingsUtils.parseSettings({ safeInfo, isVeto, t });
};
