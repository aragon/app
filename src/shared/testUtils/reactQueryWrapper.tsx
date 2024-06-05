import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';

export interface IReactQueryWrapperProps {
    /**
     * Children of the wrapper.
     */
    children?: ReactNode;
    /**
     * React query client.
     */
    client?: QueryClient;
}

export const ReactQueryWrapper: React.FC<IReactQueryWrapperProps> = (props) => {
    const { children, client = new QueryClient() } = props;

    return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
};
