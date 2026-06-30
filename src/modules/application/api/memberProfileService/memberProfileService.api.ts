import type { IRequestUrlParams } from '@/shared/api/httpService';

export interface IGetEnsTextRecordsUrlParams {
    /**
     * Aragon profile name, e.g. "test.aragon.eth".
     */
    name: string;
}

export interface IGetEnsTextRecordsParams
    extends IRequestUrlParams<IGetEnsTextRecordsUrlParams> {}
