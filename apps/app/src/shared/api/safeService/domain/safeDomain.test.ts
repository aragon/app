import {
    generateSafeBalance,
    generateSafeConfirmation,
    generateSafeInfo,
    generateSafeTransaction,
} from '@/shared/testUtils';
import {
    isSafeBalance,
    isSafeConfirmation,
    isSafeInfo,
    isSafeMultisigTransaction,
} from '.';

describe('Safe domain guards', () => {
    it.each([
        { name: 'Safe info', value: generateSafeInfo(), guard: isSafeInfo },
        {
            name: 'Safe transaction',
            value: generateSafeTransaction(),
            guard: isSafeMultisigTransaction,
        },
        {
            name: 'Safe confirmation',
            value: generateSafeConfirmation(),
            guard: isSafeConfirmation,
        },
        {
            name: 'Safe balance',
            value: generateSafeBalance(),
            guard: isSafeBalance,
        },
    ])('accepts a valid $name', ({ value, guard }) => {
        expect(guard(value)).toBe(true);
    });

    it('rejects a Safe info response without live ownership data', () => {
        expect(isSafeInfo({ address: '0xSafeAddress', nonce: '0' })).toBe(
            false,
        );
    });

    it('rejects a transaction whose confirmations do not match the confirmation contract', () => {
        expect(
            isSafeMultisigTransaction({
                ...generateSafeTransaction(),
                confirmations: [{ owner: '0xOwner' }],
            }),
        ).toBe(false);
    });
});
