import { QueryClient } from '@tanstack/react-query';
import { queryClientConfig } from '../../constants/reactQuery';

class QueryClientUtils {
    private browserQueryClient: QueryClient | undefined;

    getQueryClient = () => {
        if (typeof window === 'undefined') {
            // Server, always make a new query client
            return this.makeQueryClient();
        }

        // Create new client as browser query client hasn't been initialized yet
        this.browserQueryClient ??= this.makeQueryClient();

        return this.browserQueryClient;
    };

    private makeQueryClient = () => new QueryClient(queryClientConfig);
}

export const queryClientUtils = new QueryClientUtils();
