import {
    DefinitionList,
    EmptyState,
    StateSkeletonBar,
} from '@aragon/gov-ui-kit';
import classNames from 'classnames';
import { useTranslations } from '@/shared/components/translationsProvider';
import type { IPermissionCheckGuardResult } from '../../types';

export interface IPermissionsDefinitionListProps
    extends Pick<IPermissionCheckGuardResult, 'isLoading' | 'settings'> {
    /**
     * Additional CSS classes to apply to the component.
     */
    className?: string;
}

export const PermissionsDefinitionList: React.FC<
    IPermissionsDefinitionListProps
> = (props) => {
    const { isLoading, settings, className } = props;

    const { t } = useTranslations();

    if (isLoading) {
        return (
            <div className={classNames('flex flex-col gap-y-2', className)}>
                <StateSkeletonBar size="lg" width="40%" />
                <StateSkeletonBar size="lg" width="65%" />
                <StateSkeletonBar size="lg" width="55%" />
            </div>
        );
    }

    const hasSettings = settings.length > 0;
    const hasSettingsGroups = settings.length > 1;

    if (!hasSettings) {
        // A special case when Safes are used (we still miss settings for Safe bodies).
        return (
            <EmptyState
                description={t(
                    'app.governance.permissionsDefinitionList.empty.description',
                )}
                heading={t(
                    'app.governance.permissionsDefinitionList.empty.heading',
                )}
                isStacked={false}
                objectIllustration={{ object: 'NOT_FOUND' }}
            />
        );
    }

    return (
        <div className={classNames('', className)}>
            {settings.map((settingsGroup, groupIndex) => (
                <div className="flex flex-col gap-y-1" key={groupIndex}>
                    <DefinitionList.Container>
                        {settingsGroup.map(
                            ({ term, definition, link }, settingIndex) => (
                                <DefinitionList.Item
                                    key={settingIndex}
                                    link={link}
                                    term={term}
                                >
                                    {definition}
                                </DefinitionList.Item>
                            ),
                        )}
                    </DefinitionList.Container>
                    {hasSettingsGroups && groupIndex < settings.length - 1 && (
                        <div className="my-2 flex items-center">
                            <div className="grow border-neutral-100 border-t" />
                            <span className="mx-2 text-neutral-500">
                                {t(
                                    'app.governance.permissionsDefinitionList.or',
                                )}
                            </span>
                            <div className="grow border-neutral-100 border-t" />
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
};
