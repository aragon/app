import { useEffect, useState } from 'react';

/**
 * Returns true only after the component is mounted on the client.
 * Useful to avoid SSR/CSR hydration mismatches when rendering client-only state.
 */
export const useIsMounted = (): boolean => {
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    return isMounted;
};
