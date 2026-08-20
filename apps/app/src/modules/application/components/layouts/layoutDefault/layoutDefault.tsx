import type { ReactNode } from 'react';
import { ErrorBoundary } from '../../errorBoundary';
import { NavigationDefault } from '../../navigations/navigationDefault';

export interface ILayoutDefaultProps {
    /**
     * Children of the layout.
     */
    children?: ReactNode;
}

/**
 * Layout for the pages that are not scoped to a DAO and therefore display the generic app
 * navigation. The footer is rendered by the root layout.
 */
export const LayoutDefault: React.FC<ILayoutDefaultProps> = (props) => {
    const { children } = props;

    return (
        <>
            <NavigationDefault />
            <ErrorBoundary>{children}</ErrorBoundary>
        </>
    );
};
