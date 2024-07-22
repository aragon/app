import { usePathname } from 'next/navigation';
import { ErrorBoundaryClass, type IErrorBoundaryClassProps } from './errorBoundaryClass';

export interface IErrorBoundaryProps extends Omit<IErrorBoundaryClassProps, 'pathname'> {}

export const ErrorBoundary: React.FC<IErrorBoundaryProps> = (props) => {
    const pathname = usePathname();

    return <ErrorBoundaryClass pathname={pathname} {...props} />;
};
