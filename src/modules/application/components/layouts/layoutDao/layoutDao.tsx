import type { ReactNode } from 'react';
import { HeaderDao } from '../../headers/headerDao';

export interface ILayoutDaoProps {
    /**
     * Children of the layout.
     */
    children?: ReactNode;
}

export const LayoutDao: React.FC<ILayoutDaoProps> = (props) => {
    return (
        <>
            <HeaderDao />
            <main {...props} />
        </>
    );
};
