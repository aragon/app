import { Button, Heading, IconType } from '@aragon/gov-ui-kit';
import classNames from 'classnames';
import { type ComponentProps } from 'react';

export interface IPageMainAction {
    /**
     * Label of the action.
     */
    label: string;
    /**
     * Callback called on action click.
     */
    onClick?: () => void;
    /**
     * Link to navigate to on action click.
     */
    href?: string;
    /**
     * Hides the action when set to true.
     */
    hidden?: boolean;
}

export interface IPageMainProps extends ComponentProps<'main'> {
    /**
     * Label of the main section of the page, to be used for pages without header.
     */
    title?: string;
    /**
     * Action displayed beside the title. The action won't be displayed if the title is not defined.
     */
    action?: IPageMainAction;
    /**
     * Renders a full-width page layout when set to true.
     */
    fullWidth?: boolean;
}

export const PageMain: React.FC<IPageMainProps> = (props) => {
    const { className, children, title, action, fullWidth, ...otherProps } = props;

    return (
        <main
            className={classNames(
                'flex min-w-0 flex-col',
                { 'w-full': !fullWidth },
                { 'm-auto h-full max-w-[1024px] px-4 pt-6 pb-10 md:px-6 md:pb-20 lg:px-28': fullWidth },
                { 'gap-12': title == null },
                { 'gap-6': title != null },
                className,
            )}
            {...otherProps}
        >
            {title && (
                <header className="flex flex-row justify-between gap-6">
                    <Heading size="h1">{title}</Heading>
                    {action && !action.hidden && (
                        <Button
                            variant="primary"
                            size="md"
                            onClick={action.onClick}
                            href={action.href}
                            iconLeft={IconType.PLUS}
                        >
                            {action.label}
                        </Button>
                    )}
                </header>
            )}
            {children}
        </main>
    );
};
