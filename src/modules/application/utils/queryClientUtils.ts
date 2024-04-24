import { QueryClient } from '@tanstack/react-query';
import { queryClientConfig } from '../constants/reactQuery';

class QueryClientUtils {
    private browserQueryClient: QueryClient | undefined;

    getQueryClient = () => {
        if (typeof window === 'undefined') {
            // Server, always make a new query client
            return this.makeQueryClient();
        }

        if (this.browserQueryClient == null) {
            this.browserQueryClient = this.makeQueryClient();
        }

        return this.makeQueryClient();
    };

    private makeQueryClient = () => new QueryClient(queryClientConfig);
}

export const queryClientUtils = new QueryClientUtils();
