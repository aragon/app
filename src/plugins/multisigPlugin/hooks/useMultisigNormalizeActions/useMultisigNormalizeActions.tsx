import { useMemberList } from '@/modules/governance/api/governanceService';
import type { INormalizeActionsParams } from '@/modules/governance/types';
import { useTranslations } from '@/shared/components/translationsProvider';
import { multisigActionUtils } from '../../utils/multisigActionUtils';

export interface IUseMultisigNormalizeActionsParams extends INormalizeActionsParams {}

export const useMultisigNormalizeActions = (params: IUseMultisigNormalizeActionsParams) => {
    const { actions, daoId } = params;

    const { t } = useTranslations();

    const changeSettingsAction = actions.find((action) => multisigActionUtils.isChangeSettingsAction(action));
    const { data: memberList } = useMemberList(
        { queryParams: { daoId, pluginAddress: changeSettingsAction?.to as string } },
        { enabled: changeSettingsAction != null },
    );
    const membersCount = memberList?.pages[0].metadata.totalRecords ?? 0;

    return actions.map((action) => {
        if (multisigActionUtils.isChangeMembersAction(action)) {
            return multisigActionUtils.normalizeChangeMembersAction(action);
        } else if (multisigActionUtils.isChangeSettingsAction(action)) {
            return multisigActionUtils.normalizeChangeSettingsAction({ action, t, membersCount });
        }

        return action;
    });
};
