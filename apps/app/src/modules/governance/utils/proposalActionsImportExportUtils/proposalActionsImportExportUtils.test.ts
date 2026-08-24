import { proposalActionsImportExportUtils } from './proposalActionsImportExportUtils';

describe('proposalActionsImportExportUtils', () => {
    describe('exportActionsToJSON', () => {
        const action = {
            to: '0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
            value: '0',
            data: '0xdeadbeef',
        };

        it('exports the action fields', () => {
            expect(
                proposalActionsImportExportUtils.exportActionsToJSON([action]),
            ).toEqual([{ to: action.to, value: '0', data: action.data }]);
        });

        it.each([
            '1234567891234567891',
            '1000000000000000000000',
            '9007199254740993',
        ])(
            'keeps the wei value %p exact, which a JS number would round',
            (value) => {
                const [exported] =
                    proposalActionsImportExportUtils.exportActionsToJSON([
                        { ...action, value },
                    ]);

                expect(exported.value).toEqual(value);
                // The downloaded file must not carry a rounded or exponential amount.
                expect(JSON.stringify(exported.value)).toEqual(`"${value}"`);
            },
        );

        it('stringifies a bigint value instead of narrowing it to a number', () => {
            const value = BigInt('1234567891234567891');

            const [exported] =
                proposalActionsImportExportUtils.exportActionsToJSON([
                    { ...action, value } as unknown as typeof action,
                ]);

            expect(exported.value).toEqual('1234567891234567891');
        });

        it('falls back to zero for a missing value, which the import path rejects as empty', () => {
            const [exported] =
                proposalActionsImportExportUtils.exportActionsToJSON([
                    { ...action, value: '' },
                ]);

            expect(exported.value).toEqual('0');
        });
    });
});
