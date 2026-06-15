'use client';

import { addressUtils } from '@aragon/gov-ui-kit';
import classNames from 'classnames';
import { useEnsName } from '@/modules/ens/hooks/useEnsName';
import type { IFlowRecipient } from '../../types';

export interface IFlowAddressLabelProps {
    /**
     * EVM address to render. The component never emits the raw 42-char hex on its
     * own — worst case it falls back to `addressUtils.truncateAddress`.
     */
    address: string;
    /**
     * Pre-resolved human-readable label from `flowAddressBook` (e.g. "Treasury",
     * "Burn address", "USDC stream"). When present the component skips the ENS
     * lookup altogether — no point paying for a multicall RPC we won't render.
     */
    knownLabel?: string | null;
    /**
     * Role hint from the address book — lets us tone the chip for burn addresses
     * without every caller having to branch on the same string.
     */
    knownRole?: IFlowRecipient['role'];
    /**
     * Synchronously-known ENS (e.g. DAO ENS). Rendered as a subtitle under the
     * label when non-null and different from `knownLabel`.
     */
    knownEns?: string | null;
    /**
     * Render the subtitle line (ENS / truncated address / role). Defaults to `true`;
     * callers with tight layouts (e.g. card chips) can disable it.
     */
    showSubtitle?: boolean;
    /**
     * When true the address is rendered as a link to the block explorer / etherscan
     * — omitted by default because most call sites wrap the whole row in a link
     * already.
     */
    href?: string;
    className?: string;
}

const roleAccent: Record<NonNullable<IFlowRecipient['role']>, string> = {
    dao: 'text-primary-700',
    linkedaccount: 'text-primary-600',
    router: 'text-neutral-800',
    subrouter: 'text-neutral-700',
    burn: 'text-critical-700',
};

/**
 * Renders one of:
 *   1. `knownLabel` from the address book (synchronous, always wins).
 *   2. A resolved ENS name via `useEnsName` (async, mainnet-only, multicall-batched).
 *   3. Truncated address fallback — used while ENS resolves and when the address
 *      has no primary ENS set.
 *
 * The subtitle line shows a best-effort secondary identifier so power users can
 * still copy the raw address when needed.
 */
export const FlowAddressLabel: React.FC<IFlowAddressLabelProps> = (props) => {
    const {
        address,
        knownLabel,
        knownRole,
        knownEns,
        showSubtitle = true,
        href,
        className,
    } = props;

    // Skip the ENS fetch entirely when we already have a label — avoids spinning
    // up a wagmi query (and the associated mainnet multicall) for addresses we
    // know how to render without it.
    const ensLookupAddress = knownLabel == null ? address : undefined;
    const { data: resolvedEns, isLoading: ensLoading } =
        useEnsName(ensLookupAddress);

    const truncated = addressUtils.truncateAddress(address);

    const primary =
        (typeof knownLabel === 'string' && knownLabel.length > 0
            ? knownLabel
            : null) ??
        resolvedEns ??
        truncated;

    const subtitle = (() => {
        if (!showSubtitle) {
            return null;
        }
        // When the primary label is the ENS we already showed, keep the subtitle
        // as the raw truncated address so the user has a copy anchor.
        if (primary === resolvedEns) {
            return truncated;
        }
        // When the primary label is the address-book label, and we happen to
        // have an ENS (either known or async-resolved), show that underneath.
        const ens = knownEns ?? resolvedEns;
        if (typeof ens === 'string' && ens.length > 0 && ens !== primary) {
            return ens;
        }
        // Otherwise (known label without ENS) show the truncated address.
        if (primary !== truncated) {
            return truncated;
        }
        return null;
    })();

    const primaryClass = classNames(
        'truncate font-normal text-sm leading-tight',
        knownRole ? roleAccent[knownRole] : 'text-neutral-800',
    );

    const content = (
        <span className={classNames('flex min-w-0 flex-col', className)}>
            <span className={primaryClass}>{primary}</span>
            {subtitle != null && (
                <span className="truncate font-normal text-[11px] text-neutral-500 leading-tight">
                    {ensLoading && primary === truncated
                        ? 'Resolving ENS…'
                        : subtitle}
                </span>
            )}
        </span>
    );

    if (href != null) {
        return (
            <a
                className="min-w-0 hover:underline"
                href={href}
                onClick={(e) => e.stopPropagation()}
                rel="noopener noreferrer"
                target="_blank"
            >
                {content}
            </a>
        );
    }

    return content;
};
