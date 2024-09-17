import { IAddressInfo } from '@/shared/api/daoService';

export const generateAddressInfo = (info?: Partial<IAddressInfo>): IAddressInfo => ({
    address: '0x51cc608e50D59885009522e1b6307E72A9ECfa2c',
    ens: null,
    avatar: null,
    ...info,
});
