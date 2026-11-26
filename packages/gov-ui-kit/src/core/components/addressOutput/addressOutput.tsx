import classNames from 'classnames';
import {
    type ClipboardEvent,
    type PointerEvent as ReactPointerEvent,
    useCallback,
    useContext,
    useEffect,
    useRef,
    useState,
} from 'react';
import type { CoreCopy } from '../../assets';
import { useCopy } from '../../hooks';
import { addressUtils } from '../../utils';
import { formatAddressText, formatShortAddress } from '../addressResolution/addressLabelUtils';
import { AddressNetworkContext } from '../addressResolution/addressNetworkProvider';
import { AddressEditContext } from '../addressResolution/addressResolutionProvider';
import { useResolveAddress } from '../addressResolution/useResolveAddress';
import { AvatarIcon } from '../avatars';
import { Button } from '../button';
import { Clipboard } from '../clipboard';
import { useGukCoreContext } from '../gukCoreProvider';
import { Icon, IconType } from '../icon';
import { Link } from '../link';
import { StateSkeletonBar } from '../states';
import { Tooltip } from '../tooltip';
import { AddressChip } from './addressChip';
import { AddressDisplayBoundaryContext } from './addressDisplayBoundary';
import { InteractiveAncestorContext } from './interactiveAncestorContext';

export interface IAddressOutputProps {
    /**
     * Address to display, always the source of truth of the component. The copied and revealed value is this address
     * in its EIP-55 checksummed format, regardless of the label rendered.
     */
    address: string;
    /**
     * Display label for the address, e.g. an ENS name, a profile name or the literal `You`. Defaults to the name the
     * `AddressResolutionProvider` knows, or the truncated address.
     * @deprecated Names come from the `AddressResolutionProvider`. A label passed here still wins and skips the name
     * safety checks. Removed in the next major version.
     */
    label?: string;
    /**
     * Network of the address, to look up names saved for one network. Defaults to the one of the nearest
     * `AddressNetworkProvider`.
     */
    chainId?: number;
    /**
     * Shows the name as plain text, for lists, tables and titles that have no room for a chip or buttons: no chip, no
     * copy or edit button, a popover on the text when there is something to show. A name from another workspace reads
     * `<workspace> › <name>`.
     * @default false
     */
    text?: boolean;
    /**
     * Renders the full checksummed address instead of the truncated one. Ignored when `label` is set.
     * @default false
     */
    showCompleteAddress?: boolean;
    /**
     * URL the label links to, typically a block explorer. A truthy value also marks the address as link-like: a tap
     * navigates instead of opening the reveal and the copy control turns primary.
     */
    href?: string;
    /**
     * Whether the `href` link is external (opens in a new tab with an arrow icon). Set to false for in-app navigation.
     * @default true
     */
    isExternal?: boolean;
    /**
     * Renders an inline copy control that copies the full checksummed address. Selecting the name and copying also
     * adds the address, but only for a selection inside one `AddressOutput`. Defaults to `false` when
     * `hasInteractiveAncestor` is set, since a copy button cannot nest inside another interactive element.
     * @default true
     */
    copy?: boolean;
    /**
     * Reveals the full checksummed address on hover, keyboard focus and tap. Keyboard focus and tap fall away when
     * `hasInteractiveAncestor` is set, leaving the hover reveal.
     * @default true
     */
    reveal?: boolean;
    /**
     * Set by containers that are themselves interactive, such as a link, a button or a clickable row. The reveal then
     * hangs off a non-focusable trigger and the copy control defaults away, so the component never nests an
     * interactive control inside another one, adds a tab stop, or competes for the container's click. Defaults to the
     * nearest `InteractiveAncestorContext` value, so wrapper components can set it once for a whole subtree.
     * @default false
     */
    hasInteractiveAncestor?: boolean;
    /**
     * Additional class names for the component root.
     */
    className?: string;
}

type WarningCode = 'looks-like-address' | 'invalid-label' | 'same-name-as-yours';

const warningTextKey = {
    'looks-like-address': 'looksLikeAddress',
    'invalid-label': 'invalidLabel',
    'same-name-as-yours': 'sameNameAsYours',
} as const;

// `same-name-as-yours` is the one that matters most when a name is not yours, so it comes first.
const sortWarnings = (warnings: WarningCode[]) =>
    [...warnings].sort((a, b) => Number(b === 'same-name-as-yours') - Number(a === 'same-name-as-yours'));

// One icon for each warning, each with its text as name and title.
const WarningIcons: React.FC<{ warnings: WarningCode[]; texts: CoreCopy['addressOutput'] }> = ({ warnings, texts }) =>
    sortWarnings(warnings).map((warning) => (
        <span
            aria-label={texts[warningTextKey[warning]]}
            className="inline-flex shrink-0 text-warning-800"
            key={warning}
            role="img"
            title={texts[warningTextKey[warning]]}
        >
            <Icon icon={IconType.WARNING} size="sm" />
        </span>
    ));

const PopoverCopy: React.FC<{ value: string }> = ({ value }) => {
    const { isCopied, handleCopy } = useCopy();
    const { copy } = useGukCoreContext();

    return (
        <Button onClick={() => void handleCopy(value)} size="sm" variant="tertiary">
            {isCopied ? copy.addressOutput.copied : copy.clipboard.copy}
        </Button>
    );
};

const AddressOutputInline: React.FC<IAddressOutputProps> = (props) => {
    const inheritedInteractiveAncestor = useContext(InteractiveAncestorContext);
    const contextChainId = useContext(AddressNetworkContext);
    const onEdit = useContext(AddressEditContext);
    const { copy: copyTexts } = useGukCoreContext();
    const texts = copyTexts.addressOutput;

    const {
        address,
        label,
        chainId,
        text = false,
        showCompleteAddress = false,
        href,
        isExternal = true,
        hasInteractiveAncestor = inheritedInteractiveAncestor,
        copy = !hasInteractiveAncestor && !text,
        reveal = true,
        className,
    } = props;

    const resolved = useResolveAddress(address, chainId);
    const isLink = href != null && href.length > 0;
    const isValidAddress = addressUtils.isAddress(address);

    // A label passed by the caller (deprecated) wins and is shown as is.
    const hasLabelProp = label != null;
    const resolvedLabel = hasLabelProp ? undefined : resolved.label;
    const hasName = hasLabelProp || resolvedLabel != null;
    const warnings = hasLabelProp ? [] : resolved.warnings;
    const isNameDropped = warnings.includes('invalid-label');

    // A link label and an interactive container both rule out a focusable trigger of our own.
    const usePassiveTrigger = isLink || hasInteractiveAncestor;

    const [isOpen, setIsOpen] = useState(false);

    const isPinnedRef = useRef(false);

    const triggerRef = useRef<HTMLElement | null>(null);
    const rootRef = useRef<HTMLSpanElement>(null);
    const labelRef = useRef<HTMLElement>(null);

    const setTriggerRef = useCallback((element: HTMLElement | null) => {
        triggerRef.current = element;
    }, []);

    const close = useCallback(() => {
        isPinnedRef.current = false;
        setIsOpen(false);
    }, []);

    const handleOpenChange = useCallback((open: boolean) => {
        if (!open && isPinnedRef.current) {
            return;
        }

        setIsOpen(open);
    }, []);

    // Radix ignores touch pointers on its tooltip trigger, so tap-to-open is driven through the controlled open state.
    const handlePointerDown = (event: ReactPointerEvent<HTMLElement>) => {
        if (event.pointerType !== 'touch') {
            return;
        }

        // A tap belongs to the link label or to the surrounding container, never to the reveal. The tooltip already
        // refuses the open that the tap-induced focus asks for, so nothing has to be suppressed here.
        if (usePassiveTrigger) {
            return;
        }

        if (isPinnedRef.current) {
            close();
            return;
        }

        isPinnedRef.current = true;
        setIsOpen(true);
    };

    useEffect(() => {
        if (!isOpen) {
            return;
        }

        const handleOutsidePress = (event: PointerEvent) => {
            const target = event.target as Element;

            // The popover is drawn in a portal: a press inside it, on its copy button for example, is not outside.
            if (!triggerRef.current?.contains(target) && target.closest?.('[data-address-popover]') == null) {
                close();
            }
        };

        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                close();
            }
        };

        document.addEventListener('pointerdown', handleOutsidePress);
        document.addEventListener('keydown', handleKeyDown);

        return () => {
            document.removeEventListener('pointerdown', handleOutsidePress);
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [isOpen, close]);

    const checksumAddress = isValidAddress ? addressUtils.getChecksum(address) : address;
    const shortAddress = formatShortAddress(address);

    // What the label says: the deprecated prop, the name as is, or the text form for places with no chip.
    let shownLabel: string | undefined;
    if (hasLabelProp) {
        shownLabel = label;
    } else if (resolvedLabel != null) {
        shownLabel =
            text && resolved.source != null
                ? formatAddressText({ ...resolved, label: resolvedLabel, source: resolved.source })
                : resolvedLabel;
    }

    const chipName =
        !(hasLabelProp || text) && resolved.source === 'other-workspace' ? resolved.sourceLabel : undefined;

    let content: React.ReactNode;
    if (shownLabel != null) {
        content = (
            <>
                <WarningIcons texts={texts} warnings={warnings} />
                {chipName != null && (
                    <>
                        <span className="sr-only">{texts.sourceOtherWorkspace(chipName)}, </span>
                        <AddressChip name={chipName} />
                    </>
                )}
                <bdi className="truncate" ref={labelRef}>
                    {shownLabel}
                </bdi>
            </>
        );
    } else {
        content = (
            <>
                {isNameDropped && <WarningIcons texts={texts} warnings={['invalid-label']} />}
                <span className="truncate">{showCompleteAddress ? checksumAddress : shortAddress}</span>
            </>
        );
    }

    const nameElement = <span className="flex max-w-full min-w-0 items-center gap-x-1">{content}</span>;

    const labelElement =
        href == null ? (
            nameElement
        ) : (
            <Link className="min-w-0" href={href} isExternal={isExternal}>
                {nameElement}
            </Link>
        );

    // In text mode the popover only exists when there is something to show.
    const hasPopoverInfo = hasName || warnings.length > 0;
    const hasPopover = reveal && (!text || hasPopoverInfo);

    let popoverContent: React.ReactNode = checksumAddress;
    if (hasPopoverInfo && isValidAddress) {
        const sourceText = {
            workspace: texts.sourceWorkspace,
            'known-account': texts.sourceKnownAccount,
            ens: texts.sourceEns,
            'other-workspace': texts.sourceOtherWorkspace(resolved.sourceLabel ?? ''),
        };
        const isSaved = resolved.source === 'workspace' || resolved.source === 'other-workspace';
        const networkText =
            resolved.chainId === 0
                ? texts.savedForAllNetworks
                : texts.savedForNetwork(resolved.networkLabel ?? `Network ${resolved.chainId}`);

        popoverContent = (
            <span className="flex min-w-0 flex-col gap-y-1 text-left" data-address-popover={true}>
                {sortWarnings(warnings).map((warning) => (
                    <span className="flex items-start gap-x-1" key={warning}>
                        <Icon icon={IconType.WARNING} size="sm" />
                        {texts[warningTextKey[warning]]}
                    </span>
                ))}
                {resolvedLabel != null && resolved.source != null && (
                    <>
                        <span className="flex flex-wrap items-center gap-1">
                            {resolved.source === 'other-workspace' && <AddressChip name={resolved.sourceLabel ?? ''} />}
                            <bdi className="break-words">{resolvedLabel}</bdi>
                        </span>
                        <span>
                            {texts.nameFrom} <bdi>{sourceText[resolved.source]}</bdi>
                        </span>
                        {isSaved && <span>{networkText}</span>}
                    </>
                )}
                <span className="flex items-center gap-x-2">
                    <span className="font-mono break-all">{checksumAddress}</span>
                    <PopoverCopy value={checksumAddress} />
                </span>
            </span>
        );
    }

    // The name says where the label comes from and what to check, since it replaces the content of the trigger.
    const triggerName =
        resolvedLabel != null
            ? texts.showAddress([
                  ...(resolved.source === 'other-workspace'
                      ? [texts.sourceOtherWorkspace(resolved.sourceLabel ?? '')]
                      : []),
                  resolvedLabel,
                  ...sortWarnings(warnings).map((warning) => `${texts.warning}: ${texts[warningTextKey[warning]]}`),
              ])
            : undefined;
    const triggerClassName = classNames({ 'underline decoration-dotted underline-offset-2': text && hasPopoverInfo });

    let output = labelElement;

    if (hasPopover) {
        output = (
            <Tooltip content={popoverContent} onOpenChange={handleOpenChange} open={isOpen} triggerAsChild={true}>
                {usePassiveTrigger ? (
                    <span
                        className={classNames(
                            'inline-flex min-w-0 items-center',
                            { 'cursor-pointer': isLink, 'cursor-help': !isLink },
                            triggerClassName,
                        )}
                        onPointerDown={handlePointerDown}
                        ref={setTriggerRef}
                    >
                        {labelElement}
                    </span>
                ) : (
                    <button
                        aria-label={triggerName}
                        className={classNames(
                            'inline-flex min-w-0 cursor-help items-center text-left',
                            triggerClassName,
                        )}
                        onPointerDown={handlePointerDown}
                        ref={setTriggerRef}
                        type="button"
                    >
                        {labelElement}
                    </button>
                )}
            </Tooltip>
        );
    }

    // A name is never copied alone: the full address goes with it.
    // Only for a selection inside this component that touches the label, so no label goes alone. A selection that
    // spans several addresses is left to the browser.
    const handleCopyEvent = (event: ClipboardEvent<HTMLElement>) => {
        const selection = window.getSelection();
        const selected = selection?.toString() ?? '';
        const isInside =
            selection != null &&
            selection.rangeCount > 0 &&
            rootRef.current?.contains(selection.getRangeAt(0).commonAncestorContainer);
        const touchesLabel =
            labelRef.current != null &&
            selection != null &&
            selection.rangeCount > 0 &&
            selection.getRangeAt(0).intersectsNode(labelRef.current);

        if (isInside && touchesLabel && isValidAddress && !selected.includes(checksumAddress)) {
            event.clipboardData.setData('text/plain', `${selected} (${checksumAddress})`);
            event.preventDefault();
        }
    };

    const showEdit = onEdit != null && copy && isValidAddress && !hasName && resolved.isResolved && !text;
    const network = chainId ?? contextChainId;

    // The copy control matches the label: primary circle on a link, neutral circle on plain text. The root is a span
    // so the component stays valid phrasing content inside paragraphs and headings.
    return (
        <span
            className={classNames('inline-flex max-w-full min-w-0 items-center gap-2', className)}
            onCopy={handleCopyEvent}
            ref={rootRef}
        >
            {copy ? (
                <Clipboard copyValue={checksumAddress} size="sm" variant={isLink ? 'avatar' : 'avatar-neutral'}>
                    {output}
                </Clipboard>
            ) : (
                output
            )}
            {showEdit && (
                <button
                    aria-label={texts.nameThisAddress(shortAddress)}
                    className="cursor-pointer"
                    onClick={(event) => {
                        event.stopPropagation();
                        event.preventDefault();
                        onEdit(checksumAddress, network);
                    }}
                    type="button"
                >
                    <AvatarIcon icon={IconType.PEN} size="sm" variant="neutral" />
                </button>
            )}
        </span>
    );
};

/**
 * Decision surface: the name on line 1 and the full address on line 2, always together.
 */
const AddressOutputBoundary: React.FC<IAddressOutputProps> = (props) => {
    const { address, label, chainId, className } = props;
    const { copy: copyTexts } = useGukCoreContext();
    const texts = copyTexts.addressOutput;
    const resolved = useResolveAddress(address, chainId);

    if (!addressUtils.isAddress(address)) {
        return <span className={classNames('inline-block max-w-full break-all', className)}>{address}</span>;
    }

    const checksumAddress = addressUtils.getChecksum(address);
    const hasLabelProp = label != null;
    const warnings = hasLabelProp ? [] : resolved.warnings;
    const name = hasLabelProp ? label : resolved.label;
    const chipName = !hasLabelProp && resolved.source === 'other-workspace' ? resolved.sourceLabel : undefined;

    let line1: React.ReactNode;
    if (!hasLabelProp && resolved.isLoading) {
        line1 = <StateSkeletonBar size="lg" width={96} />;
    } else if (name != null) {
        line1 = (
            <>
                <WarningIcons texts={texts} warnings={warnings} />
                {chipName != null && (
                    <>
                        <span className="sr-only">{texts.sourceOtherWorkspace(chipName)}, </span>
                        <AddressChip name={chipName} />
                    </>
                )}
                <bdi className="truncate">{name}</bdi>
            </>
        );
    } else if (warnings.includes('invalid-label')) {
        line1 = (
            <>
                <WarningIcons texts={texts} warnings={['invalid-label']} />
                {texts.nameNotShown}
            </>
        );
    } else {
        line1 = <span className="text-neutral-500">{texts.noNameSaved}</span>;
    }

    return (
        <span className={classNames('inline-flex max-w-full min-w-0 flex-col gap-y-0.5', className)}>
            <span className="flex h-6 min-w-0 items-center gap-x-1">{line1}</span>
            <Clipboard copyValue={checksumAddress} size="sm" variant="avatar-neutral">
                <span className="font-mono text-sm break-all">{checksumAddress}</span>
            </Clipboard>
        </span>
    );
};

export const AddressOutput: React.FC<IAddressOutputProps> = (props) => {
    const isDecisionSurface = useContext(AddressDisplayBoundaryContext);

    return isDecisionSurface ? <AddressOutputBoundary {...props} /> : <AddressOutputInline {...props} />;
};
