import { useMemberList } from '@/modules/governance/api/governanceService';
import { multisigSettingsUtils } from '@/plugins/multisigPlugin/utils/multisigSettingsUtils';
import { useTranslations } from '@/shared/components/translationsProvider';
import { usePluginSettings } from '@/shared/hooks/usePluginSettings';
import type { IDaoSettingTermAndDefinition, IUseGovernanceSettingsParams } from '../../../../modules/settings/types';
import type { IMultisigPluginSettings } from '../../types';

export interface IUseMultisigGovernanceSettingsParams extends IUseGovernanceSettingsParams<IMultisigPluginSettings> {}

export const useMultisigGovernanceSettings = (
    params: IUseMultisigGovernanceSettingsParams,
): IDaoSettingTermAndDefinition[] => {
    const { daoId, settings } = params;

    const { t } = useTranslations();

    const daoMembersParams = { daoId };
    const { data: memberList } = useMemberList({ queryParams: daoMembersParams });

    const currentSettings = usePluginSettings<IMultisigPluginSettings>({ daoId });
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
