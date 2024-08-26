import type { ReactNode } from 'react';
import { NavigationWizard } from '../../navigations/navigationWizard';

export interface ILayoutProcessProps {
    /**
     * Children of the layout.
     */
    children?: ReactNode;
}

export const LayoutWizard: React.FC<ILayoutProcessProps> = (props) => {
    const { children } = props;

    return (
        <>
            <NavigationWizard />
            {children}
        </>
    );
};
