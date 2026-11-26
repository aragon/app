import { formatAddressText, formatShortAddress } from './addressLabelUtils';
import { useResolveAddress } from './useResolveAddress';

/**
 * The name of an address as a string, for places that cannot draw a component (native select options, chart text, the
 * page title). It is the label, `<workspace> › <label>` for a name from another workspace, or the short address when
 * there is no label.
 */
export const useResolveAddressText = (address: string | undefined, chainId?: number): string => {
    const { label, source, sourceLabel } = useResolveAddress(address, chainId);

    return label != null && source != null
        ? formatAddressText({ label, source, sourceLabel })
        : formatShortAddress(address);
};
