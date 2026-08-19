import 'server-only';
import type {
    IMpcActivity,
    MpcActivityType,
} from '@/modules/mpc/api/mpcService/domain';
import { getMpcStore, type IMpcStoreData, nowIso } from './mpcStore';
import { serverCrypto } from './serverCrypto';

const MAX_ACTIVITY_PER_SYSTEM = 1000;

/**
 * Appends an activity entry inside an existing store mutation (data must be persisted by the caller).
 * Never pass shares or secrets in data.
 */
export const appendActivity = (
    data: IMpcStoreData,
    params: {
        systemId: string;
        actor: string;
        type: MpcActivityType;
        data?: Record<string, unknown>;
    },
): IMpcActivity => {
    const entry: IMpcActivity = {
        id: serverCrypto.randomId(),
        systemId: params.systemId,
        at: nowIso(),
        actor: params.actor,
        type: params.type,
        data: params.data,
    };

    data.activity.push(entry);

    // Keep the POC store bounded.
    const systemEntries = data.activity.filter(
        (item) => item.systemId === params.systemId,
    );

    if (systemEntries.length > MAX_ACTIVITY_PER_SYSTEM) {
        const oldest = systemEntries[0];
        data.activity = data.activity.filter((item) => item.id !== oldest.id);
    }

    return entry;
};

/**
 * Logs an activity entry as a standalone store mutation.
 */
export const logActivity = (
    params: Parameters<typeof appendActivity>[1],
): IMpcActivity => getMpcStore().update((data) => appendActivity(data, params));

/**
 * Lists activity of a system, most recent first.
 */
export const listActivity = (systemId: string): IMpcActivity[] =>
    getMpcStore()
        .read()
        .activity.filter((item) => item.systemId === systemId)
        .sort((a, b) => b.at.localeCompare(a.at));
