import type { IGetEnsTextRecordsParams } from './memberProfileService.api';

export enum MemberProfileServiceKey {
    TEXT_RECORDS = 'TEXT_RECORDS',
}

export const memberProfileServiceKeys = {
    textRecords: (params: IGetEnsTextRecordsParams) => [
        MemberProfileServiceKey.TEXT_RECORDS,
        params,
    ],
};
