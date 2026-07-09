import type { QueryClientConfig } from '@tanstack/react-query';

export const queryClientConfig: QueryClientConfig = {
    defaultOptions: {
        queries: {
            staleTime: 60_000,
            retry: 0,
        },
    },
};
