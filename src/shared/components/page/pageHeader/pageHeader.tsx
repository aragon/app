import { Breadcrumbs, Collapsible, Heading, type IBreadcrumbsProps } from '@aragon/gov-ui-kit';
import classNames from 'classnames';
import type { ComponentProps, ReactNode } from 'react';
import { Container } from '../../container';
import { useTranslations } from '../../translationsProvider';
import { PageHeaderStat, type IPageHeaderStat } from './pageHeaderStat';

export interface IPageHeaderProps extends ComponentProps<'header'> {
    /**
     * Optional breadcrumbs for navigation.
     */
    breadcrumbs?: IBreadcrumbsProps['links'];
    /**
     * Optional tag displayed on the breadcrumbs component.
     */
    breadcrumbsTag?: IBreadcrumbsProps['tag'];
    /**
     * Title of the page.
     */
    title?: string;
    /**
     * Description of the page.
     */
    description?: string;
    /**
     * Statistics displayed on the header.
     */
    stats?: IPageHeaderStat[];
    /**
     * Optional avatar of the header.
     */
    avatar?: ReactNode;
}

export const PageHeader: React.FC<IPageHeaderProps> = (props) => {
    const { title, description, stats, avatar, breadcrumbs, breadcrumbsTag, children, className, ...otherProps } =
        props;

    const { t } = useTranslations();

    return (
        <header
            className={classNames('bg-gradient-to-b from-neutral-0 to-neutral-50 pt-6 md:pt-10', className)}
            {...otherProps}
        >
            <Container className="flex flex-col gap-6">
                {breadcrumbs && <Breadcrumbs links={breadcrumbs} tag={breadcrumbsTag} />}
                <div className="flex w-full min-w-0 flex-row gap-10 md:gap-16 lg:gap-10 xl:gap-16">
                    <div className="flex w-full flex-col">
                        <Heading size="h1">{title}</Heading>
                        <Collapsible
                            buttonLabelClosed={t('app.shared.page.header.readMore')}
                            buttonLabelOpened={t('app.shared.page.header.readLess')}
                            customCollapsedHeight={48}
                            className="text-neutral-500"
                        >
                            {description}
                        </Collapsible>
                        {stats != null && stats.length > 0 && (
                            <div className="flex flex-row gap-6 py-4 lg:gap-10 xl:gap-16">
                                {stats.map((stat) => (
                                    <PageHeaderStat key={stat.label} {...stat} />
                                ))}
                            </div>
                        )}
                    </div>
                    {avatar && <div className="hidden w-[400px] shrink-0 lg:block">{avatar}</div>}
                </div>
                {children}
            </Container>
        </header>
    );
};
