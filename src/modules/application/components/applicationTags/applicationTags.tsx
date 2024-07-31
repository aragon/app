import { getApplicationVersion } from '@/shared/components/applicationVersion';
import { useTranslations } from '@/shared/components/translationsProvider';
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

const envLabel: Record<string, string | undefined> = {
    development: 'DEV',
    staging: 'STG',
};

export const ApplicationTags: React.FC<IApplicationTagsProps> = (props) => {
    const { variant = 'primary', className, ...otherProps } = props;

    const { t } = useTranslations();

    const version = process.env.version!;

    const env = envLabel[process.env.NEXT_PUBLIC_ENV!];
    const versionLabel = env != null ? 'versionEnv' : 'version';

    return (
        <div className={classNames('flex flex-row gap-2', className)} {...otherProps}>
            <Tag variant={variant} label={t('app.application.applicationTags.beta')} />
            <Tag variant={variant} label={getApplicationVersion()} />
        </div>
    );
};
