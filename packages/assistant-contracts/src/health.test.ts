import { healthResponseSchema } from './health';

describe('healthResponseSchema', () => {
    it('accepts a valid health response', () => {
        const result = healthResponseSchema.safeParse({
            status: 'ok',
            environment: 'production',
        });

        expect(result.success).toBeTruthy();
    });

    it('rejects unknown environments and statuses', () => {
        expect(
            healthResponseSchema.safeParse({
                status: 'ok',
                environment: 'staging',
            }).success,
        ).toBeFalsy();
        expect(
            healthResponseSchema.safeParse({
                status: 'down',
                environment: 'production',
            }).success,
        ).toBeFalsy();
    });
});
