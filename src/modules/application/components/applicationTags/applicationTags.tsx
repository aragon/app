import { useTranslations } from '@/shared/components/translationsProvider';
import { useApplicationVersion } from '@/shared/hooks/useApplicationVersion';
import { Tag, type ITagProps } from '@aragon/ods';
import classNames from 'classnames';
import type { ComponentProps } from 'react';

export interface IApplicationTagsProps extends ComponentProps<'div'> {
    /**
     * Variant of the application tags.
     * @default primary
     */
    variant?: ITagProps['variant'];
}

export const ApplicationTags: React.FC<IApplicationTagsProps> = (props) => {
    const { variant = 'primary', className, ...otherProps } = props;

    const { t } = useTranslations();

    const { version, env } = useApplicationVersion();

    const versionLabel = env
        ? t('shared.useApplicationVersion.versionEnv', { version, env })
        : t('shared.useApplicationVersion.version', { version });

    return (
        <div className={classNames('flex flex-row gap-2', className)} {...otherProps}>
            <Tag variant={variant} label={t('app.application.applicationTags.beta')} />
            <Tag variant={variant} label={versionLabel} />
        </div>
    );
};
