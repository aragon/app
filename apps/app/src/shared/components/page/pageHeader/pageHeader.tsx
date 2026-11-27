import {
    AddressOutput,
    addressUtils,
    Breadcrumbs,
    Collapsible,
    Heading,
    type IBreadcrumbsProps,
} from '@aragon/gov-ui-kit';
import classNames from 'classnames';
import type { ComponentProps, ReactNode } from 'react';
import { Container } from '../../container';
import { useTranslations } from '../../translationsProvider';
import { type IPageHeaderStat, PageHeaderStat } from './pageHeaderStat';

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
    const {
        title,
        description,
        stats,
        avatar,
        breadcrumbs,
        breadcrumbsTag,
        children,
        className,
        ...otherProps
    } = props;

    const { t } = useTranslations();

    return (
        <header
            className={classNames(
                'bg-gradient-to-b from-(--guk-gradient-surface-secondary) to-(--guk-gradient-surface-primary) pt-inset-page group-has-[[data-app-sidebar]]/app:bg-none',
                className,
            )}
            {...otherProps}
        >
            <Container className="flex flex-col gap-section">
                {breadcrumbs && (
                    <Breadcrumbs links={breadcrumbs} tag={breadcrumbsTag} />
                )}
                {/* biome-ignore lint/plugin/noPrimitiveSpacing: page header gaps from lg: no role has them */}
                <div className="flex w-full min-w-0 flex-row gap-10 md:gap-16 lg:gap-10 xl:gap-16">
                    <div className="flex w-full flex-col gap-section">
                        <div className="flex flex-col gap-y-related--8-12">
                            <Heading as="h1" typeClassName="type-title-page">
                                {title != null &&
                                addressUtils.isAddress(title) ? (
                                    <AddressOutput
                                        address={title}
                                        copy={false}
                                    />
                                ) : (
                                    title
                                )}
                            </Heading>
                            {description && (
                                <Collapsible
                                    buttonLabelClosed={t(
                                        'app.shared.page.header.readMore',
                                    )}
                                    buttonLabelOpened={t(
                                        'app.shared.page.header.readLess',
                                    )}
                                    className="type-body--framework-leading text-surface-secondary"
                                    collapsedLines={2}
                                >
                                    {description}
                                </Collapsible>
                            )}
                        </div>
                        {stats != null && stats.length > 0 && (
                            // biome-ignore lint/plugin/noPrimitiveSpacing: page header gaps from lg: no role has them
                            <div className="flex flex-row gap-section py-related lg:gap-10 xl:gap-16">
                                {stats.map((stat) => (
                                    <PageHeaderStat
                                        key={stat.label}
                                        {...stat}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                    {avatar && (
                        <div className="hidden w-[400px] shrink-0 lg:block">
                            {avatar}
                        </div>
                    )}
                </div>
                {children}
            </Container>
        </header>
    );
};
