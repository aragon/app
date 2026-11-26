import { addressUtils } from '../../utils';
import { formatAddressText, formatShortAddress } from './addressLabelUtils';
import { useResolveAddress } from './useResolveAddress';

export interface IUseResolveAddressTextOptions {
    /**
     * Returns the full checksummed address instead of the short one when there is no label, as `AddressOutput` does
     * with the same prop.
     * @default false
     */
    showCompleteAddress?: boolean;
}

/**
 * The name of an address as a string, for places that cannot draw a component (native select options, chart text, the
 * page title). It is the label, `<workspace> › <label>` for a name from another workspace, or the short address when
 * there is no label.
 */
export const useResolveAddressText = (
    address: string | undefined,
    chainId?: number,
    options?: IUseResolveAddressTextOptions,
): string => {
    const { label, source, sourceLabel } = useResolveAddress(address, chainId);

    if (label != null && source != null) {
        return formatAddressText({ label, source, sourceLabel });
    }

    return options?.showCompleteAddress && address != null && addressUtils.isAddress(address)
        ? addressUtils.getChecksum(address)
        : formatShortAddress(address);
};
