import { queryClientUtils } from './queryClientUtils';

describe('queryClient utils (client)', () => {
    it('getQueryClient returns a query-client instance', () => {
        const client = queryClientUtils.getQueryClient();
        expect(client).toBeDefined();
    });

    it('getQueryClient does not create a new query-client if already created', () => {
        const client = queryClientUtils.getQueryClient();
        const newClient = queryClientUtils.getQueryClient();
        expect(client === newClient).toBeTruthy();
    });
});
