import {
    generateSafeBalance,
    generateSafeConfirmation,
    generateSafeInfo,
    generateSafeTransaction,
} from '@/shared/testUtils';
import {
    isAragonProposalReport,
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

    it.each([
        { field: 'submissionDate', value: undefined },
        { field: 'submissionDate', value: 1_700_000_000 },
        { field: 'executionDate', value: null },
    ])(
        'rejects a transaction whose $field is $value, because the row renders it as a date',
        ({ field, value }) => {
            expect(
                isSafeMultisigTransaction({
                    ...generateSafeTransaction(),
                    [field]: value,
                }),
            ).toBe(false);
        },
    );

    it.each(['value', 'safeTxGas', 'baseGas', 'gasPrice'])(
        'rejects a transaction whose %s is not an unsigned integer string, because hashing parses it',
        (field) => {
            // `BigInt('0x…')` would throw out of envelope hashing and reach the signer as a
            // generic failure, so the shape guard refuses the row instead.
            expect(
                isSafeMultisigTransaction({
                    ...generateSafeTransaction(),
                    [field]: '0xdead',
                }),
            ).toBe(false);
        },
    );

    it('keeps the queue readable when a correlated report is malformed, because the guard gates every row', () => {
        expect(
            isSafeMultisigTransaction({
                ...generateSafeTransaction(),
                aragonReports: [{ daoId: 'ethereum-sepolia-0xDao' }],
            }),
        ).toBe(true);
    });

    it('accepts an empty report list, the backend signal for a report it could not resolve', () => {
        expect(isAragonProposalReport({})).toBe(false);
        expect(
            isSafeMultisigTransaction({
                ...generateSafeTransaction(),
                aragonReports: [],
            }),
        ).toBe(true);
    });

    it('accepts a well-formed report, including entries in different DAOs', () => {
        const reports = [
            {
                daoId: 'ethereum-sepolia-0xDaoOne',
                bodyId: '0xPluginOne',
                proposalId: 4,
                stageId: '0',
                resultType: 2,
            },
            {
                daoId: 'ethereum-sepolia-0xDaoTwo',
                bodyId: '0xPluginTwo',
                proposalId: 7,
                stageId: '1',
                resultType: 1,
            },
        ];

        expect(reports.every(isAragonProposalReport)).toBe(true);
    });

    it('rejects a report whose proposal id is the contract id rather than the backend incremental id', () => {
        expect(
            isAragonProposalReport({
                daoId: 'ethereum-sepolia-0xDao',
                bodyId: '0xPlugin',
                // The contract's uint256 proposal id arrives as a string and would build a URL
                // that resolves to nothing.
                proposalId: '89751198517555286281858792404674662298',
                stageId: '0',
                resultType: 2,
            }),
        ).toBe(false);
    });
});
