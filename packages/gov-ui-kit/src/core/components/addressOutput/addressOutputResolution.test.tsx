import { fireEvent, render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import type { ReactNode } from 'react';
import { clipboardUtils } from '../../utils';
import {
    AddressNetworkProvider,
    AddressResolutionProvider,
    addressEntryKey,
    type IAddressEntry,
} from '../addressResolution';
import { Tag } from '../tag';
import { AddressDisplayBoundary } from './addressDisplayBoundary';
import { AddressOutput, type IAddressOutputProps } from './addressOutput';
import { InteractiveAncestorContext } from './interactiveAncestorContext';

describe('<AddressOutput /> address resolution', () => {
    const address = '0xd8da6bf26964af9d7eed9e03e53415d37aa96045';
    const checksum = '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045';

    const own: IAddressEntry = { label: 'Treasury', source: 'workspace' };
    const entriesOf = (entry?: IAddressEntry, chainId = 0) =>
        entry == null ? new Map() : new Map([[addressEntryKey(address, chainId), entry]]);

    const setup = (
        props?: Partial<IAddressOutputProps>,
        options?: {
            entry?: IAddressEntry;
            onEdit?: () => void;
            chainId?: number;
            wrap?: (node: ReactNode) => ReactNode;
        },
    ) => {
        const node = <AddressOutput address={address} {...props} />;

        return render(
            <AddressResolutionProvider entries={entriesOf(options?.entry)} onEdit={options?.onEdit}>
                <AddressNetworkProvider chainId={options?.chainId}>
                    {options?.wrap ? options.wrap(node) : node}
                </AddressNetworkProvider>
            </AddressResolutionProvider>,
        );
    };

    it('shows the label in bdi instead of the short address, with only the copy control', () => {
        setup(undefined, { entry: own, onEdit: jest.fn() });
        const label = screen.getByText('Treasury');
        expect(label.closest('bdi')).not.toBeNull();
        expect(screen.queryByText('0xd8da…6045')).not.toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Copy' })).toBeInTheDocument();
        expect(screen.queryByRole('button', { name: /Name this address/ })).not.toBeInTheDocument();
    });

    it('popover shows the full address, the source and the network line', async () => {
        const user = userEvent.setup();
        setup(undefined, { entry: own });
        await user.hover(screen.getByRole('button', { name: 'Treasury, show address' }));
        const popover = await screen.findByRole('tooltip');
        expect(popover).toHaveTextContent(checksum);
        expect(popover).toHaveTextContent('Your workspace');
        expect(popover).toHaveTextContent('Saved for all networks');
    });

    it('popover shows the network of a bound name', async () => {
        const user = userEvent.setup();
        render(
            <AddressResolutionProvider entries={entriesOf({ ...own, networkLabel: 'Base' }, 8453)}>
                <AddressOutput address={address} chainId={8453} />
            </AddressResolutionProvider>,
        );
        await user.hover(screen.getByRole('button', { name: 'Treasury, show address' }));
        expect(await screen.findByRole('tooltip')).toHaveTextContent('Saved for Base');
    });

    it('draws a chip with the workspace name for another workspace, cut at 12 code points', () => {
        setup(undefined, {
            entry: { label: 'Treasury', source: 'other-workspace', sourceLabel: 'A very long workspace name' },
        });
        expect(screen.getByText('A very long …', { exact: false })).toBeInTheDocument();
        expect(screen.getByText('Workspace “A very long workspace name”,', { exact: false })).toBeInTheDocument();
    });

    it('renders a label that looks like a chip as plain text, and keeps the chip apart from the You tag', () => {
        setup(undefined, { entry: { label: 'Workspace C', source: 'workspace' } });
        expect(screen.getByText('Workspace C')).toBeInTheDocument();
        expect(screen.queryByTestId('address-chip')).not.toBeInTheDocument();

        const { container } = render(
            <>
                <Tag label="You" />
                <AddressResolutionProvider
                    entries={entriesOf({ label: 'x', source: 'other-workspace', sourceLabel: 'You' })}
                >
                    <AddressOutput address={address} />
                </AddressResolutionProvider>
            </>,
        );
        const tag = screen.getByText('You', { selector: 'p' }).parentElement;
        const chip = container.querySelector('[data-testid="address-chip"]');
        expect(chip).not.toBeNull();
        expect(chip?.className).not.toEqual(tag?.className);
        expect(chip?.querySelector('svg')).not.toBeNull();
        expect(tag?.querySelector('svg')).toBeNull();
    });

    it('quotes a workspace named "Your workspace" in the source text', async () => {
        const user = userEvent.setup();
        setup(undefined, { entry: { label: 'T', source: 'other-workspace', sourceLabel: 'Your workspace' } });
        await user.hover(screen.getByRole('button', { name: /, T, show address$/ }));
        expect(await screen.findByRole('tooltip')).toHaveTextContent('Workspace “Your workspace”');
    });

    it('shows a warning icon before an 0x label and the warning in the popover', async () => {
        const user = userEvent.setup();
        setup(undefined, { entry: { label: '0xDAO', source: 'workspace' } });
        expect(
            screen.getByRole('img', { name: 'This name starts with 0x. Check the address below.' }),
        ).toBeInTheDocument();
        await user.hover(
            screen.getByRole('button', {
                name: '0xDAO, Warning: This name starts with 0x. Check the address below., show address',
            }),
        );
        expect(await screen.findByRole('tooltip')).toHaveTextContent(
            'This name starts with 0x. Check the address below.',
        );
    });

    it('shows the short address with a warning and a popover when the saved name is dropped', async () => {
        const user = userEvent.setup();
        setup(undefined, { entry: { label: 'Vault 0x123456', source: 'workspace' }, onEdit: jest.fn() });
        expect(screen.getByText('0xd8da…6045')).toBeInTheDocument();
        expect(screen.getByRole('img', { name: /not shown because it is not safe/ })).toBeInTheDocument();
        // Edit shows after invalid-label: no label is shown.
        expect(screen.getByRole('button', { name: 'Name this address 0xd8da…6045' })).toBeInTheDocument();
        await user.hover(
            screen.getByRole('button', {
                name: 'The name saved for this address is not shown because it is not safe. 0xd8da…6045',
            }),
        );
        expect(await screen.findByRole('tooltip')).toHaveTextContent(checksum);
    });

    it('a deprecated label prop wins and skips the check', () => {
        setup({ label: 'Vault 0x123456' }, { entry: own });
        expect(screen.getByText('Vault 0x123456')).toBeInTheDocument();
        expect(screen.queryByRole('img')).not.toBeInTheDocument();
    });

    describe('edit button (inv. 12)', () => {
        it('shows beside copy for a raw address when onEdit is set, and calls it with the address and network', async () => {
            const user = userEvent.setup();
            const onEdit = jest.fn();
            setup(undefined, { onEdit, chainId: 8453 });
            await user.click(screen.getByRole('button', { name: 'Name this address 0xd8da…6045' }));
            expect(onEdit).toHaveBeenCalledWith(checksum, 8453);
        });

        it('is off without onEdit, without a copy button, and inside an interactive ancestor', () => {
            setup();
            expect(screen.queryByRole('button', { name: /Name this address/ })).not.toBeInTheDocument();
            setup({ copy: false }, { onEdit: jest.fn() });
            expect(screen.queryByRole('button', { name: /Name this address/ })).not.toBeInTheDocument();
            setup(undefined, {
                onEdit: jest.fn(),
                wrap: (node) => (
                    <InteractiveAncestorContext.Provider value={true}>{node}</InteractiveAncestorContext.Provider>
                ),
            });
            expect(screen.queryByRole('button', { name: /Name this address/ })).not.toBeInTheDocument();
        });

        it('is off while the resolver is loading, and for a value that is not an address', () => {
            const resolve = () => new Promise<null>(() => undefined);
            render(
                <AddressResolutionProvider onEdit={jest.fn()} resolve={resolve}>
                    <AddressOutput address={address} />
                    <AddressOutput address="You" />
                </AddressResolutionProvider>,
            );
            expect(screen.queryByRole('button', { name: /Name this address/ })).not.toBeInTheDocument();
        });
    });

    describe('copy (inv. 10)', () => {
        it('copies the checksummed address from the popover', async () => {
            const user = userEvent.setup();
            const copy = jest.spyOn(clipboardUtils, 'copy').mockResolvedValue();
            setup(undefined, { entry: own });
            await user.hover(screen.getByRole('button', { name: 'Treasury, show address' }));
            await screen.findByRole('tooltip');
            await user.click(screen.getAllByRole('button', { name: 'Copy' }).at(-1) as HTMLElement);
            expect(copy).toHaveBeenCalledWith(checksum);
            copy.mockRestore();
        });

        it('copying selected label text puts the label and the full address on the clipboard', () => {
            setup(undefined, { entry: own });
            const label = screen.getByText('Treasury');
            const range = document.createRange();
            range.selectNodeContents(label);
            const selection = window.getSelection();
            selection?.removeAllRanges();
            selection?.addRange(range);
            const data = { setData: jest.fn() };
            fireEvent.copy(label, { clipboardData: data });
            expect(data.setData).toHaveBeenCalledWith('text/plain', `Treasury (${checksum})`);
        });
    });

    describe('text mode (inv. 16)', () => {
        it('shows the label as plain text with a popover trigger, and no copy or edit button', () => {
            setup({ text: true }, { entry: own, onEdit: jest.fn() });
            expect(screen.getByRole('button', { name: 'Treasury, show address' })).toBeInTheDocument();
            expect(screen.queryByRole('button', { name: 'Copy' })).not.toBeInTheDocument();
            expect(screen.queryByRole('button', { name: /Name this address/ })).not.toBeInTheDocument();
        });

        it('uses the text form for another workspace, with no chip', () => {
            setup(
                { text: true },
                { entry: { label: 'Treasury', source: 'other-workspace', sourceLabel: 'Workspace C' } },
            );
            expect(screen.getByText('Workspace C › Treasury')).toBeInTheDocument();
            expect(screen.queryByTestId('address-chip')).not.toBeInTheDocument();
        });

        it('shows a plain short address with no trigger when there is nothing to show', () => {
            setup({ text: true });
            expect(screen.getByText('0xd8da…6045')).toBeInTheDocument();
            expect(screen.queryByRole('button')).not.toBeInTheDocument();
        });
    });

    describe('<AddressDisplayBoundary /> (inv. 11)', () => {
        const inBoundary = (props?: Partial<IAddressOutputProps>, entry?: IAddressEntry) =>
            setup(props, {
                entry,
                onEdit: jest.fn(),
                wrap: (node) => <AddressDisplayBoundary>{node}</AddressDisplayBoundary>,
            });

        it('shows the label and the full address together, with no popover and no edit button', async () => {
            const user = userEvent.setup();
            inBoundary(undefined, own);
            expect(screen.getByText('Treasury')).toBeInTheDocument();
            expect(screen.getByText(checksum)).toBeInTheDocument();
            expect(screen.queryByRole('button', { name: /show address|Name this address/ })).not.toBeInTheDocument();
            await user.hover(screen.getByText('Treasury'));
            expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
        });

        it('shows "No name saved" without a label and "Name not shown" after an invalid label', () => {
            inBoundary();
            expect(screen.getByText('No name saved')).toBeInTheDocument();
            expect(screen.getByText(checksum)).toBeInTheDocument();
        });

        it('shows "Name not shown" after an invalid label', () => {
            inBoundary(undefined, { label: 'Vault 0x123456', source: 'workspace' });
            expect(screen.getByText('Name not shown')).toBeInTheDocument();
            expect(screen.getByText(checksum)).toBeInTheDocument();
        });

        it('keeps the chip on line 1 and ignores text and copy props', () => {
            inBoundary(
                { text: true, copy: false },
                { label: 'Treasury', source: 'other-workspace', sourceLabel: 'Workspace C' },
            );
            expect(screen.getByTestId('address-chip')).toBeInTheDocument();
            expect(screen.getByText(checksum)).toBeInTheDocument();
            expect(screen.getByRole('button', { name: 'Copy' })).toBeInTheDocument();
        });

        it('shows a value that is not an address as is', () => {
            render(
                <AddressDisplayBoundary>
                    <AddressOutput address="not-an-address" />
                </AddressDisplayBoundary>,
            );
            expect(screen.getByText('not-an-address')).toBeInTheDocument();
            expect(screen.queryByText('No name saved')).not.toBeInTheDocument();
        });
    });
});
