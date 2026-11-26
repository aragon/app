import {
    ADDRESS_TEXT_SEPARATOR,
    addressEntryKey,
    checkLabel,
    classifyAddressLike,
    formatAddressText,
    isSafeToDisplay,
    validateName,
} from './addressLabelUtils';

describe('addressLabelUtils', () => {
    const address = '0xd8da6bf26964af9d7eed9e03e53415d37aa96045';

    describe('addressEntryKey', () => {
        it('lowercases the address and joins the chain id', () => {
            expect(addressEntryKey('0xD8dA6BF26964aF9D7eEd9e03E53415D37aA96045', 8453)).toBe(`${address}:8453`);
            expect(addressEntryKey(address, 0)).toBe(`${address}:0`);
        });
    });

    describe('classifyAddressLike', () => {
        it.each([
            ['0x123456', 'address'],
            ['０ｘ１２３４５６', 'address'],
            ['Vault 0x1234…abcd', 'address'],
            ['Vault 0x123456', 'address'],
            ['0xDAO', 'prefix'],
            ['0x12345', 'prefix'],
            ['Treasury', null],
            ['Box 0x12', null],
            ['', null],
        ])('classifies %p as %p', (text, expected) => {
            expect(classifyAddressLike(text)).toBe(expected);
        });
    });

    describe('isSafeToDisplay', () => {
        it.each([
            ['Treasury', true],
            ['Tresorería ñ 財庫', true],
            ['', false],
            ['   ', false],
            ['a'.repeat(64), true],
            ['a'.repeat(65), false],
            ['😀'.repeat(64), true],
            ['😀'.repeat(65), false],
            ['bad‮name', false], // bidi override
            ['bad​name', false], // zero width space
            ['bad\u0000name', false], // control
            ['bad\nname', false],
            ['bad name', false], // line separator
            ['bad name', false], // no-break space
            ['bad　name', false], // ideographic space
            ['bad⠀name', false], // braille blank
            ['bad\uD800name', false], // lone surrogate
            ['á̂̃̄', false], // 4 combining marks in a row
            ['á̂̃', true],
            [`Workspace ${ADDRESS_TEXT_SEPARATOR} Treasury`, false],
        ])('isSafeToDisplay(%p) is %p', (text, expected) => {
            expect(isSafeToDisplay(text)).toBe(expected);
        });
    });

    describe('checkLabel', () => {
        it('keeps a safe label with no warnings', () => {
            expect(checkLabel({ label: 'Treasury', source: 'workspace' })).toEqual({ ok: true, warnings: [] });
        });

        it('drops a label that looks like an address or is unsafe', () => {
            expect(checkLabel({ label: 'Vault 0x123456', source: 'ens' })).toEqual({ ok: false });
            expect(checkLabel({ label: 'a‮b', source: 'known-account' })).toEqual({ ok: false });
        });

        it('keeps an 0x prefix with a warning', () => {
            expect(checkLabel({ label: '0xDAO', source: 'workspace' })).toEqual({
                ok: true,
                warnings: ['looks-like-address'],
            });
        });

        it('drops an entry whose workspace or network text is unsafe', () => {
            expect(checkLabel({ label: 'A', source: 'other-workspace', sourceLabel: 'W​' })).toEqual({ ok: false });
            expect(checkLabel({ label: 'A', source: 'workspace', networkLabel: 'N › x' })).toEqual({ ok: false });
        });
    });

    describe('formatAddressText', () => {
        it('returns the label alone for own, account and ENS names', () => {
            expect(formatAddressText({ label: 'Treasury', source: 'workspace' })).toBe('Treasury');
            expect(formatAddressText({ label: 'Safe', source: 'known-account' })).toBe('Safe');
            expect(formatAddressText({ label: 'vitalik.eth', source: 'ens' })).toBe('vitalik.eth');
        });

        it('puts the workspace name first for another workspace, cut at 12 code points', () => {
            expect(
                formatAddressText({ label: 'Treasury', source: 'other-workspace', sourceLabel: 'Workspace C' }),
            ).toBe(`Workspace C ${ADDRESS_TEXT_SEPARATOR} Treasury`);
            expect(formatAddressText({ label: 'T', source: 'other-workspace', sourceLabel: 'abcdefghijklmnop' })).toBe(
                `abcdefghijkl… ${ADDRESS_TEXT_SEPARATOR} T`,
            );
        });
    });

    describe('validateName', () => {
        it.each([
            ['', 'empty'],
            ['  ', 'empty'],
            ['a'.repeat(41), 'too-long'],
            ['Work › Treasury', 'contains-separator'],
            ['bad​name', 'invalid-characters'],
            ['Main  Safe', 'extra-spaces'],
            ['Main Safe ', 'extra-spaces'],
            [' Main Safe', 'extra-spaces'],
            ['0x123456', 'looks-like-address'],
            ['Vault 0x123456', 'looks-like-address'],
            ['treasury.eth', 'looks-like-ens'],
            ['Treasury.v2', 'looks-like-ens'],
            ['treasury。eth', 'looks-like-ens'],
            ['Official Treasury', 'confusing-word'],
            ['Official-', 'confusing-word'],
            ['Verified', 'confusing-word'],
        ])('rejects %p with %p', (text, reason) => {
            expect(validateName(text)).toEqual({ ok: false, reason });
        });

        it.each(['Treasury', 'Treasury v2', 'v1.5', 'Mr. Smith', '0fficial', 'a'.repeat(40)])('accepts %p', (text) => {
            expect(validateName(text)).toEqual({ ok: true, warnings: [] });
        });

        it('accepts 0xDAO with a warning', () => {
            expect(validateName('0xDAO')).toEqual({ ok: true, warnings: ['looks-like-address'] });
        });
    });

    it('feeds the form and the provider rule the same cases', () => {
        // Invariant 8: both use classifyAddressLike, so `address` is a form error and a dropped label.
        for (const text of ['0x123456', 'Vault 0x123456', '０ｘ１２３４５６']) {
            expect(validateName(text)).toEqual({ ok: false, reason: 'looks-like-address' });
            expect(checkLabel({ label: text, source: 'workspace' })).toEqual({ ok: false });
        }
        expect(validateName('0xDAO')).toEqual({ ok: true, warnings: ['looks-like-address'] });
        expect(checkLabel({ label: '0xDAO', source: 'workspace' })).toEqual({
            ok: true,
            warnings: ['looks-like-address'],
        });
    });
});
