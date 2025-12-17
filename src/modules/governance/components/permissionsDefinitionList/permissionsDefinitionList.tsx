import { DefinitionList, StateSkeletonBar } from '@aragon/gov-ui-kit';
import { useTranslations } from '@/shared/components/translationsProvider';
import type { IPermissionCheckGuardResult } from '../../types';

export interface IPermissionsDefinitionListProps extends Pick<IPermissionCheckGuardResult, 'isLoading' | 'settings'> {}

export const PermissionsDefinitionList: React.FC<IPermissionsDefinitionListProps> = (props) => {
    const { isLoading, settings } = props;

    const { t } = useTranslations();

    if (isLoading) {
        return (
            <div className="flex flex-col gap-y-2">
                <StateSkeletonBar size="lg" width="40%" />
                <StateSkeletonBar size="lg" width="65%" />
            </div>
        );
    }

    const hasSettingsGroups = settings.length > 1;

    return (
        <div>
            {settings.map((settingsGroup, groupIndex) => {
                const groupKey = settingsGroup.map(({ term }) => term).join('-') || groupIndex.toString();
                return (
                    <div className="flex flex-col gap-y-1" key={groupKey}>
                        <DefinitionList.Container>
                            {settingsGroup.map(({ term, definition, link }) => (
                                <DefinitionList.Item key={`${groupKey}-${term}`} link={link} term={term}>
                                    {definition}
                                </DefinitionList.Item>
                            ))}
                        </DefinitionList.Container>
                        {hasSettingsGroups && groupIndex < settings.length - 1 && (
                            <div className="my-2 flex items-center">
                                <div className="grow border-neutral-100 border-t" />
                                <span className="mx-2 text-neutral-500">{t('app.governance.permissionCheckDialog.or')}</span>
                                <div className="grow border-neutral-100 border-t" />
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
};
