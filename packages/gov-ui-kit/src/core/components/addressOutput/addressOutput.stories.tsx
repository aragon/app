import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import {
    AddressNetworkProvider,
    AddressResolutionProvider,
    addressEntryKey,
    type IAddressEntry,
} from '../addressResolution';
import { Button } from '../button';
import { Dialog } from '../dialogs';
import { Radio, RadioGroup } from '../forms';
import { Tag } from '../tag';
import { AddressDisplayBoundary } from './addressDisplayBoundary';
import { AddressOutput } from './addressOutput';

const meta: Meta<typeof AddressOutput> = {
    title: 'Core/AddressOutput',
    component: AddressOutput,
    argTypes: {
        address: {
            control: 'text',
            description: 'Address to display, always the source of truth of the component.',
        },
        label: {
            control: 'text',
            description:
                'Deprecated. Names come from the AddressResolutionProvider. A label passed here still wins and skips the safety checks.',
        },
        chainId: {
            control: 'number',
            description: 'Network of the address. Defaults to the one of the nearest AddressNetworkProvider.',
        },
        text: {
            control: 'boolean',
            description: 'Plain text name for lists, tables and titles: no chip, no copy or edit button.',
        },
        showCompleteAddress: {
            control: 'boolean',
            description:
                'Renders the full checksummed address instead of the truncated one. Ignored when label is set.',
        },
        href: {
            control: 'text',
            description:
                'URL the label links to, typically a block explorer. A truthy value marks the address as link-like: tap navigates instead of opening the reveal and the copy control turns primary.',
        },
        isExternal: {
            control: 'boolean',
            description: 'Whether the href link is external (new tab + arrow). Set false for in-app navigation.',
        },
        copy: {
            control: 'boolean',
            description: 'Renders an inline copy control that copies the full checksummed address.',
        },
        reveal: {
            control: 'boolean',
            description: 'Reveals the full checksummed address on hover, keyboard focus and tap.',
        },
    },
};

type Story = StoryObj<typeof AddressOutput>;

const address = '0xd8da6bf26964af9d7eed9e03e53415d37aa96045';

/**
 * Default usage. `reveal` and `copy` are on by default: the full checksummed address is revealed on hover,
 * keyboard focus and tap, with an inline copy control.
 */
export const Default: Story = {
    args: { address },
    render: (props) => (
        <div className="flex h-20 items-end">
            <AddressOutput {...props} />
        </div>
    ),
};

/**
 * The label stays the display only; the reveal shows the same checksummed address whatever the label is.
 */
export const WithLabel: Story = {
    args: { address, label: 'vitalik.eth' },
    render: (props) => (
        <div className="flex h-20 items-end">
            <AddressOutput {...props} />
        </div>
    ),
};

/**
 * Escape hatch that renders the full checksummed address instead of the truncated one.
 */
export const Full: Story = {
    args: { address, showCompleteAddress: true },
    render: (props) => (
        <div className="flex h-20 items-end">
            <AddressOutput {...props} />
        </div>
    ),
};

/**
 * With `href`, the label is rendered as an external explorer link, so a tap keeps navigating. The reveal then only
 * opens on hover and keyboard focus, and the copy control turns primary to match the link.
 */
export const Link: Story = {
    args: { address, href: `https://etherscan.io/address/${address}` },
    render: (props) => (
        <div className="flex h-20 items-end">
            <AddressOutput {...props} />
        </div>
    ),
};

/**
 * Flags can be turned off independently.
 */
export const PlainText: Story = {
    args: { address, copy: false, reveal: false },
    render: (props) => (
        <div className="flex h-20 items-end">
            <AddressOutput {...props} />
        </div>
    ),
};

/**
 * Reproduces the reveal opening on its own when the component sits inside a dialog.
 *
 * A dialog moves focus into its content on open: Radix's `FocusScope` focuses the first tabbable element it finds,
 * skipping links, and a Radix tooltip trigger opens instantly on focus without telling programmatic focus apart from
 * a keyboard `Tab`. So whenever the dialog's first tabbable element is one of the tooltip triggers this component
 * renders, that tooltip is already open when the dialog appears.
 *
 * Pick a layout and open the dialog with the mouse only:
 *
 * - `address` — the reveal button is first, so the checksummed address is revealed on open.
 * - `link` — the reveal trigger is a link and gets skipped, so the `Copy` tooltip opens instead.
 * - `close button` / `preceding button` — focus lands elsewhere and no tooltip opens, which is the correct behaviour.
 */
export const InsideDialog: Story = {
    args: { address },
    render: (props) => {
        const [layout, setLayout] = useState('address');
        const [open, setOpen] = useState(false);

        const closeDialog = () => setOpen(false);

        return (
            <div className="flex flex-col items-start gap-4">
                <RadioGroup
                    className="md:grid md:grid-cols-2"
                    label="First tabbable element of the dialog"
                    onValueChange={setLayout}
                    value={layout}
                >
                    <Radio label="Address reveal button" value="address" />
                    <Radio label="Address rendered as a link" value="link" />
                    <Radio label="Header close button" value="close-button" />
                    <Radio label="A preceding button" value="preceding-button" />
                </RadioGroup>
                <Button onClick={() => setOpen(true)} variant="primary">
                    Open dialog
                </Button>
                <Dialog.Root onOpenChange={setOpen} open={open}>
                    <Dialog.Header
                        onClose={layout === 'close-button' ? closeDialog : undefined}
                        title="Address details"
                    />
                    <Dialog.Content className="flex flex-col items-start gap-4 pb-4 md:pb-6">
                        {layout === 'preceding-button' && <Button variant="secondary">Focused on open</Button>}
                        <AddressOutput
                            {...props}
                            href={layout === 'link' ? `https://etherscan.io/address/${props.address}` : undefined}
                        />
                    </Dialog.Content>
                </Dialog.Root>
            </div>
        );
    },
};

export default meta;

const withEntry = (entry?: IAddressEntry, chainId = 0) =>
    new Map(entry == null ? [] : [[addressEntryKey(address, chainId), entry]]);

const Resolved: React.FC<{
    entry?: IAddressEntry;
    chainId?: number;
    entryChainId?: number;
    onEdit?: boolean;
    boundary?: boolean;
    text?: boolean;
    resolve?: () => Promise<null>;
}> = ({ entry, chainId, entryChainId, onEdit, boundary, text, resolve }) => {
    const output = <AddressOutput address={address} text={text} />;

    return (
        <AddressResolutionProvider
            entries={withEntry(entry, entryChainId)}
            onEdit={onEdit ? () => undefined : undefined}
            resolve={resolve}
        >
            <AddressNetworkProvider chainId={chainId}>
                <div className="flex min-h-32 w-80 items-start pt-2">
                    {boundary ? <AddressDisplayBoundary>{output}</AddressDisplayBoundary> : output}
                </div>
            </AddressNetworkProvider>
        </AddressResolutionProvider>
    );
};

/**
 * A name from the provider replaces the short address. Hover the name to see the address, the source and the network.
 */
export const OwnName: Story = { render: () => <Resolved entry={{ label: 'Treasury', source: 'workspace' }} /> };

/**
 * A name saved for one network shows only on that network, and the popover says so.
 */
export const NetworkBound: Story = {
    render: () => (
        <Resolved
            chainId={8453}
            entry={{ label: 'Base Safe', source: 'known-account', networkLabel: 'Base' }}
            entryChainId={8453}
        />
    ),
};

/**
 * A name from another workspace carries a chip with the workspace name. The chip has its own outlined style, so it
 * never looks like the kit `Tag` beside it.
 */
export const OtherWorkspace: Story = {
    render: () => (
        <div className="flex flex-col gap-2">
            <Resolved entry={{ label: 'Treasury', source: 'other-workspace', sourceLabel: 'Workspace C' }} />
            <Tag label="You" />
            <Resolved entry={{ label: 'Treasury', source: 'other-workspace', sourceLabel: 'You' }} />
        </div>
    ),
};

/**
 * A long workspace name is cut in the chip. The popover has the full name.
 */
export const LongWorkspaceName: Story = {
    render: () => (
        <Resolved entry={{ label: 'Treasury', source: 'other-workspace', sourceLabel: 'A very long workspace name' }} />
    ),
};

/**
 * A right-to-left name stays in its own isolated box.
 */
export const RightToLeft: Story = { render: () => <Resolved entry={{ label: 'خزينة الدعم', source: 'workspace' }} /> };

/**
 * A name that starts with 0x is shown with a warning.
 */
export const WarningLooksLikeAddress: Story = {
    render: () => <Resolved entry={{ label: '0xDAO', source: 'workspace' }} />,
};

/**
 * A name that equals one of yours, for another address, is shown with a warning.
 */
export const WarningSameNameAsYours: Story = {
    render: () => (
        <AddressResolutionProvider
            entries={
                new Map<string, IAddressEntry>([
                    [
                        addressEntryKey('0x1111111111111111111111111111111111111111', 0),
                        { label: 'Treasury', source: 'workspace' },
                    ],
                    [
                        addressEntryKey(address, 0),
                        { label: 'Treasury', source: 'other-workspace', sourceLabel: 'Workspace C' },
                    ],
                ])
            }
        >
            <div className="flex min-h-32 pt-2">
                <AddressOutput address={address} />
            </div>
        </AddressResolutionProvider>
    ),
};

/**
 * A saved name that is not safe to show is dropped: the short address shows with a warning and a popover. The edit
 * button is back, to replace the name.
 */
export const InvalidName: Story = {
    render: () => <Resolved entry={{ label: 'Vault 0x123456', source: 'workspace' }} onEdit={true} />,
};

/**
 * With `onEdit` set on the provider, an address without a name gets an edit button beside copy.
 */
export const EditButton: Story = { render: () => <Resolved onEdit={true} /> };

/**
 * While the resolver works, the short address shows. Nothing moves when the name arrives.
 */
export const Loading: Story = { render: () => <Resolved resolve={() => new Promise<null>(() => undefined)} /> };

/**
 * `text` shows the name as plain text with a dotted underline when there is a popover. A name from another workspace
 * reads `workspace › name`.
 */
export const TextMode: Story = {
    render: () => (
        <div className="flex flex-col gap-2">
            <Resolved entry={{ label: 'Treasury', source: 'workspace' }} text={true} />
            <Resolved
                entry={{ label: 'Treasury', source: 'other-workspace', sourceLabel: 'Workspace C' }}
                text={true}
            />
            <Resolved text={true} />
        </div>
    ),
};

/**
 * On a decision surface, the name and the full address always show together. No popover, no edit button.
 */
export const DecisionSurface: Story = {
    render: () => (
        <div className="flex flex-col gap-4">
            <Resolved
                boundary={true}
                entry={{ label: 'Treasury', source: 'other-workspace', sourceLabel: 'Workspace C' }}
            />
            <Resolved boundary={true} />
            <Resolved boundary={true} entry={{ label: 'Vault 0x123456', source: 'workspace' }} />
            <Resolved boundary={true} resolve={() => new Promise<null>(() => undefined)} />
        </div>
    ),
};
