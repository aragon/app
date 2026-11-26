import { fireEvent, render, renderHook, screen } from '@testing-library/react';
import type { ReactNode } from 'react';
import {
    AddressResolutionProvider,
    addressEntryKey,
    type IAddressEntry,
    useResolveAddress,
} from '../addressResolution';
import { AddressDisplayBoundary } from './addressDisplayBoundary';
import { AddressOutput } from './addressOutput';

// Safety behaviours of AddressOutput: warnings in the trigger and on decision surfaces, same-name matching, copying a label with its address.
describe('<AddressOutput /> safety', () => {
    const attacker = '0xd8da6bf26964af9d7eed9e03e53415d37aa96045';
    const yours = '0x1111111111111111111111111111111111111111';

    const entriesOf = (...rows: [string, IAddressEntry][]) =>
        new Map(rows.map(([address, entry]) => [addressEntryKey(address, 0), entry]));

    const renderWith = (entries: ReadonlyMap<string, IAddressEntry>, node: ReactNode) =>
        render(<AddressResolutionProvider entries={entries}>{node}</AddressResolutionProvider>);

    it('the trigger name tells the workspace and the warning of an other-workspace name', () => {
        const entries = entriesOf(
            [yours, { label: 'Treasury', source: 'workspace' }],
            [attacker, { label: 'Treasury', source: 'other-workspace', sourceLabel: 'Workspace C' }],
        );
        renderWith(entries, <AddressOutput address={attacker} />);

        const trigger = screen.getByRole('button', {
            name: /^Workspace “Workspace C”, Treasury, Warning: You saved this name/,
        });
        expect(trigger).toHaveAccessibleName(/, show address$/);
        expect(trigger).not.toHaveAccessibleName('Treasury, show address');
    });

    it.each([
        ['double space', 'Main  Safe'],
        ['trailing space', 'Main Safe '],
        ['leading space', ' Main Safe'],
    ])('%s matches your name for same-name-as-yours', (_, name) => {
        const entries = entriesOf(
            [yours, { label: 'Main Safe', source: 'known-account' }],
            [attacker, { label: name, source: 'other-workspace', sourceLabel: 'Workspace C' }],
        );
        const { result } = renderHook(() => useResolveAddress(attacker), {
            wrapper: ({ children }) => (
                <AddressResolutionProvider entries={entries}>{children}</AddressResolutionProvider>
            ),
        });

        expect(result.current.label).toBe(name);
        expect(result.current.warnings).toEqual(['same-name-as-yours']);
    });

    it('copying part of a label puts that part and the address on the clipboard', () => {
        renderWith(
            entriesOf([attacker, { label: 'Treasury', source: 'workspace' }]),
            <AddressOutput address={attacker} />,
        );
        const label = screen.getByText('Treasury');
        const range = document.createRange();
        range.setStart(label.firstChild as Text, 0);
        range.setEnd(label.firstChild as Text, 7);
        window.getSelection()?.removeAllRanges();
        window.getSelection()?.addRange(range);
        const data = { setData: jest.fn() };

        fireEvent.copy(label, { clipboardData: data });

        expect(data.setData).toHaveBeenCalledWith('text/plain', 'Treasur (0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045)');
    });

    it('a decision surface tells every warning, same-name-as-yours first', () => {
        const entries = entriesOf(
            [yours, { label: '0xDAO', source: 'workspace' }],
            [attacker, { label: '0xDAO', source: 'other-workspace', sourceLabel: 'Workspace C' }],
        );
        renderWith(
            entries,
            <AddressDisplayBoundary>
                <AddressOutput address={attacker} />
            </AddressDisplayBoundary>,
        );

        const icons = screen.getAllByRole('img');
        expect(icons).toHaveLength(2);
        expect(icons[0]).toHaveAccessibleName(/You saved this name/);
        expect(icons[1]).toHaveAccessibleName(/starts with 0x/);
    });

    it('a selection across two addresses is left to the browser', () => {
        const other = '0x2222222222222222222222222222222222222222';
        renderWith(
            entriesOf(
                [attacker, { label: 'Treasury', source: 'workspace' }],
                [other, { label: 'Ops', source: 'workspace' }],
            ),
            <>
                <AddressOutput address={attacker} />
                <AddressOutput address={other} />
            </>,
        );
        const range = document.createRange();
        range.setStartBefore(screen.getByText('Treasury'));
        range.setEndAfter(screen.getByText('Ops'));
        window.getSelection()?.removeAllRanges();
        window.getSelection()?.addRange(range);
        const data = { setData: jest.fn() };

        fireEvent.copy(screen.getByText('Treasury'), { clipboardData: data });

        expect(data.setData).not.toHaveBeenCalled();
    });

    it('a deprecated label on a decision surface still shows the full address', () => {
        renderWith(
            new Map(),
            <AddressDisplayBoundary>
                <AddressOutput address={attacker} label="vitalik.eth" />
            </AddressDisplayBoundary>,
        );

        expect(screen.getByText('vitalik.eth')).toBeInTheDocument();
        expect(screen.getByText('0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045')).toBeInTheDocument();
    });
});
