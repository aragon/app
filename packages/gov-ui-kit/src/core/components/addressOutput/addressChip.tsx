import { truncateSourceLabel } from '../addressResolution';

export interface IAddressChipProps {
    /**
     * Name of the other workspace. Untrusted text, shown cut at 12 code points.
     */
    name: string;
}

/**
 * Marks a name that comes from another workspace. It has its own outlined style and a fixed icon that no name can
 * contain, so a workspace name cannot look like a kit `Tag` such as "You".
 */
export const AddressChip: React.FC<IAddressChipProps> = (props) => (
    <span
        aria-hidden={true}
        className="inline-flex shrink-0 items-center gap-0.5 rounded-sm border border-neutral-200 px-1 text-sm leading-tight text-neutral-600"
        data-testid="address-chip"
    >
        <svg aria-hidden={true} className="size-3" fill="none" stroke="currentColor" viewBox="0 0 12 12">
            <rect height="8" rx="1" strokeWidth="1" width="8" x="2" y="2" />
            <path d="M2 5h8M5 5v5" strokeWidth="1" />
        </svg>
        <bdi>{truncateSourceLabel(props.name)}</bdi>
    </span>
);
