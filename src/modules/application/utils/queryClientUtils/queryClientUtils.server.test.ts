/**
 * @jest-environment node
 */

import { queryClientUtils } from './queryClientUtils';

describe('queryClient utils (server)', () => {
    it('getQueryClient returns a query-client instance', () => {
        const client = queryClientUtils.getQueryClient();
        expect(client).toBeDefined();
    });

    it('getQueryClient always create a new query-client instance', () => {
        const client = queryClientUtils.getQueryClient();
        const newClient = queryClientUtils.getQueryClient();
        expect(client === newClient).toBeFalsy();
    });
});
