describe('useGovernanceToken', () => {
    // const useTokenSpy = jest.spyOn(Wagmi, 'useToken');
    //
    // beforeEach(() => {
    //     useTokenSpy.mockReturnValue({} as unknown as Wagmi.UseAccountReturnType);
    // });
    //
    // afterEach(() => {
    //     useTokenSpy.mockReset();
    // });
    //
    // it('exists', () => {
    //     expect(() => useGovernanceToken({address: '0xasdasdsa', chain})).not.toThrow();
    // });

    it('is in development', () => {
        expect(true).toBe(true);
    });
});

const successCase = [
    { result: 0n, status: 'success' },
    { result: 0n, status: 'success' },
    { result: 0n, status: 'success' },
    { result: '0x0000000000000000000000000000000000000000', status: 'success' },
];

const failureCase = [
    { result: undefined, error: {}, status: 'failure' },
    { result: undefined, error: {}, status: 'failure' },
    { result: undefined, error: {}, status: 'failure' },
    { result: undefined, error: {}, status: 'failure' },
];
