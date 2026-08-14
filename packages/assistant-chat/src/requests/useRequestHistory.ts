import { useState } from 'react';
import { getRequestHistory, type IRequestHistoryEntry } from './requestHistory';

/**
 * Reads the device-local request history. A read per mount is enough: both places that show it
 * (the link under the composer and the requests view) mount when the user enters them, which is
 * always after a ticket has been filed.
 */
export const useRequestHistory = (): IRequestHistoryEntry[] => {
    const [requestHistory] = useState(getRequestHistory);

    return requestHistory;
};
