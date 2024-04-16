import type { ComponentProps } from 'react';
import { HeaderProcess } from '../../headers/headerProcess';

export interface ILayoutProcessProps extends ComponentProps<'main'> {}

export const LayoutProcess: React.FC<ILayoutProcessProps> = (props) => {
    return (
        <>
            <HeaderProcess />
            <main {...props} />
        </>
    );
};
