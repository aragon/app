import { useMemberList } from '@/modules/governance/api/governanceService';
import type { INormalizeActionsParams } from '@/modules/governance/types';
import { useTranslations } from '@/shared/components/translationsProvider';
import type { IMultisigPluginSettings } from '../../types';
import { multisigActionUtils } from '../../utils/multisigActionUtils';

export interface IUseMultisigNormalizeActionsParams extends INormalizeActionsParams<IMultisigPluginSettings> {}

export const useMultisigNormalizeActions = (params: IUseMultisigNormalizeActionsParams) => {
    const { proposal, plugin, daoId } = params;

    const { t } = useTranslations();

    const daoMembersParams = { daoId, pluginAddress: plugin.address };
    const { data: memberList } = useMemberList({ queryParams: daoMembersParams });
    const membersCount = memberList?.pages[0].metadata.totalRecords ?? 0;

    return proposal.actions.map((action) => {
        if (multisigActionUtils.isChangeMembersAction(action)) {
            return multisigActionUtils.normalizeChangeMembersAction(action);
        } else if (multisigActionUtils.isChangeSettingsAction(action)) {
            const params = { action, settings: plugin.settings, t, membersCount };
            return multisigActionUtils.normalizeChangeSettingsAction(params);
        }

        return action;
    });
};
