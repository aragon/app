import { useMemberList } from '@/modules/governance/api/governanceService';
import type { IDaoMultisigSettings } from '@/plugins/multisigPlugin/types';
import { multisigSettingsUtils } from '@/plugins/multisigPlugin/utils/multisigSettingsUtils';
import { useDaoSettings } from '@/shared/api/daoService';
import { useTranslations } from '@/shared/components/translationsProvider';
import type { IDaoSettingTermAndDefinition, IUseGovernanceSettingsParams } from '../../../../modules/settings/types';

export interface IUseMultisigGovernanceSettingsParams extends IUseGovernanceSettingsParams<IDaoMultisigSettings> {}

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

    return multisigSettingsUtils.parseSettings({
        settings: processedSettings,
        membersCount: memberList.pages[0].metadata.totalRecords,
        t,
    });
};
