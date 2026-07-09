import type { ensRecordKeys } from './constants/ensConfig';

/** Union of all ENS text-record key strings we fetch (e.g. `'description'`, `'com.twitter'`). */
export type TEnsRecordKey = (typeof ensRecordKeys)[keyof typeof ensRecordKeys];

/** Map of ENS text-record key → resolved value (or `null` if not set). */
export interface IEnsRecords
    extends Partial<Record<TEnsRecordKey, string | null>> {}
