import { generatePaginatedResponse, generatePaginatedResponseMetadata } from '@/shared/testUtils';
import { AragonBackendService } from './aragonBackendService';

class ServiceTest extends AragonBackendService {}

describe('AragonBackend service', () => {
    let serviceTest = new ServiceTest();

    afterEach(() => {
        serviceTest = new ServiceTest();
    });

    describe('getNextPageParams', () => {
        it('returns undefined when there are no more items to fetch', () => {
            const previousPageMeta = generatePaginatedResponseMetadata({ page: 10, totalPages: 10 });
            const previousPage = generatePaginatedResponse({ metadata: previousPageMeta });
            const previousParams = { queryParams: {} };
            expect(serviceTest.getNextPageParams(previousPage, [previousPage], previousParams)).toBeUndefined();
        });

        it('returns the params to fetch the next page when having more items to fetch', () => {
            const previousPageMeta = generatePaginatedResponseMetadata({ page: 20, totalPages: 25 });
            const previousPage = generatePaginatedResponse({ metadata: previousPageMeta });
            const previousParams = { queryParams: { otherParams: 'value' }, urlParams: { id: 'test' } };
            expect(serviceTest.getNextPageParams(previousPage, [previousPage], previousParams)).toEqual({
                ...previousParams,
                queryParams: {
                    ...previousParams.queryParams,
                    page: 21,
                },
            });
        });
    });
});
