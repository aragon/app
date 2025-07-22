import { useTranslations } from '@/shared/components/translationsProvider';
import { useSlotSingleFunction } from '@/shared/hooks/useSlotSingleFunction';
import { DefinitionList, StateSkeletonBar } from '@aragon/gov-ui-kit';
import { GovernanceSlotId } from '../../constants/moduleSlots';
import type { IPermissionCheckGuardParams, IPermissionCheckGuardResult } from '../../types';

export interface IProposalPermissionsDefinitionListProps extends IPermissionCheckGuardParams {}

export const ProposalPermissionsDefinitionList: React.FC<IProposalPermissionsDefinitionListProps> = (props) => {
    const { useConnectedUserInfo = true, plugin, daoId } = props;

    const { t } = useTranslations();

    const { isLoading, settings } = useSlotSingleFunction<IPermissionCheckGuardParams, IPermissionCheckGuardResult>({
        slotId: GovernanceSlotId.GOVERNANCE_PERMISSION_CHECK_PROPOSAL_CREATION,
        pluginId: plugin.interfaceType,
        params: { plugin, daoId, useConnectedUserInfo },
    }) ?? { hasPermission: true, isLoading: false, settings: [] };

    if (isLoading) {
        return (
            <div className="flex flex-col gap-y-2">
                <StateSkeletonBar width="40%" size="lg" />
                <StateSkeletonBar width="65%" size="lg" />
            </div>
        );
    }

    return (
        <>
            {settings.map((group, i) => (
                <div key={i} className="flex flex-col gap-y-1">
                    <DefinitionList.Container>
                        {group.map(({ term, definition, link, description, copyValue }, j) => (
                            <DefinitionList.Item
                                key={j}
                                term={term}
                                link={link}
                                description={description}
                                copyValue={copyValue}
                            >
                                {definition}
                            </DefinitionList.Item>
                        ))}
                    </DefinitionList.Container>
                    {settings.length > 1 && i < settings.length - 1 && (
                        <div className="my-2 flex items-center">
                            <div className="grow border-t border-neutral-100" />
                            <span className="mx-2 text-neutral-500">
                                {t('app.governance.permissionCheckDialog.or')}
                            </span>
                            <div className="grow border-t border-neutral-100" />
                        </div>
                    )}
                </div>
            ))}
        </>
    );
};
