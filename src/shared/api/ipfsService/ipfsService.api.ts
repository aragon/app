import type { IRequestBodyParams } from '../httpService';

export interface IPinJsonParams extends IRequestBodyParams<object> {}

export interface IPinFileParams extends IRequestBodyParams<File> {}
