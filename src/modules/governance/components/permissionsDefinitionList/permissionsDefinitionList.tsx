import { useTranslations } from '@/shared/components/translationsProvider';
import { DefinitionList, StateSkeletonBar } from '@aragon/gov-ui-kit';
import type { IPermissionCheckGuardResult } from '../../types';

export interface IPermissionsDefinitionListProps extends Pick<IPermissionCheckGuardResult, 'isLoading' | 'settings'> {}

export const PermissionsDefinitionList: React.FC<IPermissionsDefinitionListProps> = (props) => {
    const { isLoading, settings } = props;

    const { t } = useTranslations();

    if (isLoading) {
        return (
            <div className="flex flex-col gap-y-2">
                <StateSkeletonBar width="40%" size="lg" />
                <StateSkeletonBar width="65%" size="lg" />
            </div>
        );
    }

    const hasSettingsGroups = settings.length > 1;

    console.log('settings', settings);

    return (
        <div>
            {settings.map((settingsGroup, groupIndex) => (
                <div key={groupIndex} className="flex flex-col gap-y-1">
                    <DefinitionList.Container>
                        {settingsGroup.map(({ term, definition, link }, settingIndex) => (
                            <DefinitionList.Item key={settingIndex} term={term} link={link}>
                                {definition}
                            </DefinitionList.Item>
                        ))}
                    </DefinitionList.Container>
                    {hasSettingsGroups && groupIndex < settings.length - 1 && (
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
        </div>
    );
};
