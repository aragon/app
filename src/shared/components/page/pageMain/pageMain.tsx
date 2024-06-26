import { Button, Heading, IconType } from '@aragon/ods';
import classNames from 'classnames';
import { type ComponentProps } from 'react';
import { PageContextProvider } from '../pageContext';

export interface IPageMainAction {
    /**
     * Label of the action.
     */
    label: string;
    /**
     * Callback called on action click.
     */
    onClick?: () => void;
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
}

const mainContextValues = { contentType: 'main' as const };

export const PageMain: React.FC<IPageMainProps> = (props) => {
    const { className, children, title, action, ...otherProps } = props;

    return (
        <PageContextProvider value={mainContextValues}>
            <main
                className={classNames(
                    'flex flex-col lg:w-2/3',
                    { 'gap-20': title == null },
                    { 'gap-6': title != null },
                    className,
                )}
                {...otherProps}
            >
                {title && (
                    <header className="flex flex-row justify-between gap-6">
                        <Heading size="h1">{title}</Heading>
                        {action && (
                            <Button variant="primary" size="md" onClick={action.onClick} iconLeft={IconType.PLUS}>
                                {action.label}
                            </Button>
                        )}
                    </header>
                )}
                {children}
            </main>
        </PageContextProvider>
    );
};
