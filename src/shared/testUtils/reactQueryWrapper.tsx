import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';

export const ReactQueryWrapper = (props: { children: ReactNode }) => (
    <QueryClientProvider client={new QueryClient()}>{props.children}</QueryClientProvider>
);
