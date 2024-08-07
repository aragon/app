import { useMemberList } from '@/modules/governance/api/governanceService';
import type { IDaoMultisigSettings } from '@/plugins/multisigPlugin/types';
import { useDaoSettings } from '@/shared/api/daoService';
import { useTranslations } from '@/shared/components/translationsProvider';
import type { IDaoSettingTermAndDefinition } from '../../../../modules/settings/types';
import { multisigSettingsUtils } from '@/plugins/multisigPlugin/utils/multisigSettingsUtils';

interface IUseMultisigGovernanceSettingsParams {
    /**
     * ID of the Dao.
     */
    daoId: string;
    /**
     * Settings of the multisig based Dao.
     */
    settings?: IDaoMultisigSettings | IDaoSettingTermAndDefinition[];
}

export const useMultisigGovernanceSettings = (
    params: IUseMultisigGovernanceSettingsParams,
): IDaoSettingTermAndDefinition[] => {
    const { daoId, settings } = params;

    const { t } = useTranslations();

    const daoSettingsParams = { daoId };
    const { data: memberList } = useMemberList({ queryParams: daoSettingsParams });
    const { data: currentSettings } = useDaoSettings<IDaoMultisigSettings>(
        { urlParams: daoSettingsParams },
        { enabled: settings == null },
    );
    const processedSettings = settings ?? currentSettings;

    if (processedSettings == null || memberList == null) {
        return [];
    }

    return multisigSettingsUtils.parseSettings({settings: processedSettings, memberList, t});
};
