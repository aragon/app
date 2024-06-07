import type { ReactNode } from 'react';
import { NavigationProcess } from '../../navigations/navigationProcess';

export interface ILayoutProcessProps {
    /**
     * Children of the layout.
     */
    children?: ReactNode;
}

export const LayoutProcess: React.FC<ILayoutProcessProps> = (props) => {
    const { children } = props;

    return (
        <>
            <NavigationProcess />
            {children}
        </>
    );
};
