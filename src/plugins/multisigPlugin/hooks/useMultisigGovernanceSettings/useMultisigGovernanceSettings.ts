import { useMemberList } from '@/modules/governance/api/governanceService';
import { multisigSettingsUtils } from '@/plugins/multisigPlugin/utils/multisigSettingsUtils';
import { useTranslations } from '@/shared/components/translationsProvider';
import type { IDefinitionSetting } from '@aragon/gov-ui-kit';
import type { IUseGovernanceSettingsParams } from '../../../../modules/settings/types';
import type { IMultisigPluginSettings } from '../../types';

export interface IUseMultisigGovernanceSettingsParams extends IUseGovernanceSettingsParams<IMultisigPluginSettings> {}

export const useMultisigGovernanceSettings = (params: IUseMultisigGovernanceSettingsParams): IDefinitionSetting[] => {
    const { daoId, pluginAddress, settings, isVeto } = params;

    const { t } = useTranslations();

    const daoMembersParams = { daoId, pluginAddress };
    const { data: memberList } = useMemberList({ queryParams: daoMembersParams });

    if (memberList == null) {
        return [];
    }

    return multisigSettingsUtils.parseSettings({
        settings,
        membersCount: memberList.pages[0].metadata.totalRecords,
        isVeto,
        t,
    });
};
