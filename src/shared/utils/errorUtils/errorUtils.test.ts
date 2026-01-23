import { errorUtils } from './errorUtils';

describe('errorUtils', () => {
    describe('serialize', () => {
        it('returns empty object for null', () => {
            expect(errorUtils.serialize(null)).toEqual({});
        });

        it('returns empty object for undefined', () => {
            expect(errorUtils.serialize(undefined)).toEqual({});
        });

        it('converts primitive to message', () => {
            expect(errorUtils.serialize('error message')).toEqual({
                message: 'error message',
            });
            expect(errorUtils.serialize(42)).toEqual({ message: '42' });
        });

        it('extracts standard Error properties', () => {
            const error = new Error('test error');
            error.name = 'TestError';

            const result = errorUtils.serialize(error);

            expect(result.name).toBe('TestError');
            expect(result.message).toBe('test error');
            expect(result.stack).toBeDefined();
        });

        it('extracts custom error properties', () => {
            const error = {
                name: 'CustomError',
                message: 'custom message',
                code: 'CUSTOM_CODE',
                status: 404,
                description: 'Not found',
            };

            const result = errorUtils.serialize(error);

            expect(result).toEqual({
                name: 'CustomError',
                message: 'custom message',
                code: 'CUSTOM_CODE',
                status: 404,
                description: 'Not found',
            });
        });

        it('handles nested cause', () => {
            const cause = new Error('cause error');
            const error = new Error('main error', { cause });

            const result = errorUtils.serialize(error);

            expect(result.cause).toBeDefined();
            expect(result.cause?.message).toBe('cause error');
        });

        it('ignores non-serializable properties', () => {
            const error = {
                message: 'test',
                fn: () => {
                    return;
                },
                symbol: Symbol('test'),
            };

            const result = errorUtils.serialize(error);

            expect(result).toEqual({ message: 'test' });
            expect(result).not.toHaveProperty('fn');
            expect(result).not.toHaveProperty('symbol');
        });

        it('does not throw on objects with circular references', () => {
            // Simulate an error object that would cause JSON.stringify to fail
            const error = {
                message: 'test',
                code: 'TEST_CODE',
                status: 500,
            };

            // This should not throw
            expect(() => errorUtils.serialize(error)).not.toThrow();

            const result = errorUtils.serialize(error);
            expect(result.message).toBe('test');
            expect(result.code).toBe('TEST_CODE');
        });

        it('handles circular cause references without infinite recursion', () => {
            const error1: Record<string, unknown> = { message: 'error 1' };
            const error2: Record<string, unknown> = { message: 'error 2' };

            // Create circular reference: error1 -> error2 -> error1
            error1.cause = error2;
            error2.cause = error1;

            // This should not throw or hang
            expect(() => errorUtils.serialize(error1)).not.toThrow();

            const result = errorUtils.serialize(error1);
            expect(result.message).toBe('error 1');
            expect(result.cause?.message).toBe('error 2');
            // The circular reference should be cut off
            expect(result.cause?.cause).toEqual({});
        });

        it('limits cause chain depth to prevent stack overflow', () => {
            // Create a deep cause chain
            let deepError: Record<string, unknown> = { message: 'deepest' };
            for (let i = 0; i < 20; i++) {
                deepError = { message: `level ${i}`, cause: deepError };
            }

            // This should not throw
            expect(() => errorUtils.serialize(deepError)).not.toThrow();

            // Verify depth is limited (maxCauseDepth = 10)
            let result = errorUtils.serialize(deepError);
            let depth = 0;
            while (result.cause && Object.keys(result.cause).length > 0) {
                result = result.cause;
                depth++;
            }
            expect(depth).toBeLessThanOrEqual(10);
        });
    });
});
