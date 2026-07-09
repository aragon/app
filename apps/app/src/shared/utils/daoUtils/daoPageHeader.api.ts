import type { ComponentProps } from 'react';
import type { IDao } from '@/shared/api/daoService';

export interface IDaoPageHeaderProps extends ComponentProps<'header'> {
    /**
     * DAO to display and generate navigation links for.
     */
    dao: IDao;
}
