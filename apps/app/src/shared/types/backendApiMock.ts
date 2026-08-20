export interface IBackendApiMock {
    /**
     * URL to mock the response for.
     */
    url: RegExp;
    /**
     * Type of the mock:
     * - merge: Merge the actual response from the backend with the specified data;
     * - replace: Replaces the response from the backend entirely;
     */
    type: 'merge' | 'replace';
    /**
     * HTTP method to mock the response for. The mock applies to every method when not set.
     */
    method?: string;
    /**
     * Mocked response for the given URL.
     */
    data: object;
}
