import type { ReactNode } from 'react';
import { HeaderProcess } from '../../headers/headerProcess';

export interface ILayoutProcessProps {
    /**
     * Children of the layout.
     */
    children?: ReactNode;
}

export const LayoutProcess: React.FC<ILayoutProcessProps> = (props) => {
    return (
        <>
            <HeaderProcess />
            <main {...props} />
        </>
    );
};
