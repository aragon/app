import { Icon, IconType } from '@aragon/gov-ui-kit';
import classNames from 'classnames';
import type { ComponentProps, ReactNode } from 'react';
import { Link } from '@/shared/components/link';
import { useTranslations } from '@/shared/components/translationsProvider';
import type { INavigationLink } from '../navigationLinks';
import { NavigationLinks } from '../navigationLinks';

export interface INavigationSidebarProps extends ComponentProps<'nav'> {
    /**
     * Links of the sidebar, rendered as a column.
     */
    links: INavigationLink[];
    /**
     * Links rendered below the main ones, apart behind a divider (e.g. the settings of the workspace, below the
     * sections of the account it is scoped to).
     */
    secondaryLinks?: INavigationLink[];
    /**
     * Content above the links (e.g. the DAO or workspace selector).
     */
    header?: ReactNode;
    /**
     * Content pinned to the bottom of the sidebar (e.g. the wallet and the footer).
     */
    footer?: ReactNode;
}

/**
 * Side navigation of the application from the `lg` breakpoint, hidden below it where the navigation bar and its
 * dialog take over. Render it beside the page content through `LayoutSidebar`, which keeps the content measuring its
 * own width rather than the width of the sidebar plus the content. It opens with the way back to the explore page,
 * above the header, so that link does not read as one of the sections.
 */
export const NavigationSidebar: React.FC<INavigationSidebarProps> = (props) => {
    const { links, secondaryLinks, header, footer, className, ...otherProps } =
        props;

    const { t } = useTranslations();

    return (
        <nav
            className={classNames(
                'sticky top-0 hidden h-dvh w-64 shrink-0 flex-col gap-6 self-start overflow-y-auto border-neutral-100 border-r bg-neutral-0 px-3 py-4 lg:flex',
                className,
            )}
            {...otherProps}
        >
            <div className="flex flex-col gap-4">
                <Link
                    className="focus-ring-primary flex items-center gap-1 self-start rounded-md px-1 text-neutral-500 text-sm transition-colors hover:text-neutral-800"
                    href="/"
                >
                    <Icon icon={IconType.CHEVRON_LEFT} size="sm" />
                    {t('app.application.navigationDao.dialog.explore')}
                </Link>
                {header != null && (
                    <div className="flex flex-col gap-2">{header}</div>
                )}
            </div>
            <div className="flex flex-col gap-4">
                <NavigationLinks links={links} variant="column" />
                {secondaryLinks != null && (
                    <>
                        <div className="w-full px-4">
                            <div className="border-neutral-100 border-t" />
                        </div>
                        <NavigationLinks
                            links={secondaryLinks}
                            variant="column"
                        />
                    </>
                )}
            </div>
            {footer != null && (
                <div className="mt-auto flex flex-col gap-4">{footer}</div>
            )}
        </nav>
    );
};
