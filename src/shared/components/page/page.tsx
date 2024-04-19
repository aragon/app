import classNames from 'classnames';
import type { ComponentProps } from 'react';
import { Container } from '../container';

export interface IPageProps extends ComponentProps<'div'> {}

export const Page: React.FC<IPageProps> = (props) => {
    const { className, ...otherProps } = props;

    return <Container className={classNames('', className)} {...otherProps} />;
};
