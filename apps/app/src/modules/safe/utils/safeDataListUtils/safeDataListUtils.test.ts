import { safeDataListUtils } from './safeDataListUtils';

describe('safeDataListUtils', () => {
    describe('getDataListState', () => {
        it.each([
            {
                params: { isError: true, isLoading: false },
                expected: 'error',
            },
            {
                params: { isError: true, isLoading: true },
                expected: 'error',
            },
            {
                params: { isError: false, isLoading: true },
                expected: 'initialLoading',
            },
            {
                params: { isError: false, isLoading: false },
                expected: 'idle',
            },
        ])(
            'returns $expected for isError=$params.isError isLoading=$params.isLoading',
            ({ params, expected }) => {
                expect(safeDataListUtils.getDataListState(params)).toEqual(
                    expected,
                );
            },
        );
    });
});
