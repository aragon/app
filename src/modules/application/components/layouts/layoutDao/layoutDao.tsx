import type { ComponentProps } from 'react';
import { HeaderDao } from '../../headers/headerDao';

export interface ILayoutDaoProps extends ComponentProps<'main'> {}

export const LayoutDao: React.FC<ILayoutDaoProps> = (props) => {
    return (
        <>
            <HeaderDao />
            <main {...props} />
        </>
    );
};
