import { useMemberList } from '@/modules/governance/api/governanceService';
import type { INormalizeActionsParams } from '@/modules/governance/types';
import { useTranslations } from '@/shared/components/translationsProvider';
import type { IMultisigPluginSettings } from '../../types';
import { multisigActionUtils } from '../../utils/multisigActionUtils';

export interface IUseMultisigNormalizeActionsParams extends INormalizeActionsParams<IMultisigPluginSettings> {}

export const useMultisigNormalizeActions = (params: IUseMultisigNormalizeActionsParams) => {
    const { actions, settings, daoId } = params;

    const { t } = useTranslations();

    const daoMembersParams = { daoId, pluginAddress: settings.pluginAddress };
    const { data: memberList } = useMemberList({ queryParams: daoMembersParams });
    const membersCount = memberList?.pages[0].metadata.totalRecords ?? 0;

    return actions.map((action) => {
        if (multisigActionUtils.isChangeMembersAction(action)) {
            return multisigActionUtils.normalizeChangeMembersAction(action);
        } else if (multisigActionUtils.isChangeSettingsAction(action)) {
            return multisigActionUtils.normalizeChangeSettingsAction({ action, settings, t, membersCount });
        }

        return action;
    });
};
