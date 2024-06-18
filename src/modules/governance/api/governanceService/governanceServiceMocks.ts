import { generatePaginatedResponse, generatePaginatedResponseMetadata } from '@/shared/testUtils';
import { generateMember } from '../../testUtils/generators';

export const membersMock = generatePaginatedResponse({
    data: [
        generateMember({ address: '0x1f9090aae28b8a3dceadf281b0f12828e676c326', ens: null, type: 'multisig' }),
        generateMember({ address: '0x2B988D1A98Ce8F583Ae81F234F8AF83C0b50FD79', ens: null, type: 'multisig' }),
        generateMember({ address: '0x07D810ceEfd01c941ab9Fb90dd2311Bd5f5148D7', ens: null, type: 'multisig' }),
        generateMember({ address: '0xa12159e5131b1eEf6B4857EEE3e1954744b5033A', ens: null, type: 'multisig' }),
        generateMember({ address: '0x429ed5433320fe199dDA24F00E33F2d73F225e71', ens: null, type: 'multisig' }),
        generateMember({ address: '0x64378C990Ef9e485ac98690F12b210575c67a60c', ens: null, type: 'multisig' }),
        generateMember({ address: '0xE90d8Fb7B79C8930B5C8891e61c298b412a6e81a', ens: null, type: 'multisig' }),
        generateMember({ address: '0x65fa7EFae6069D6E1FEa303b8305c848b1D256CE', ens: null, type: 'multisig' }),
        generateMember({ address: '0x274C375273d8CADb69F0a584FB8f4614B7A2fe28', ens: null, type: 'multisig' }),
    ],
    metadata: generatePaginatedResponseMetadata({ page: 1, pageSize: 8, totalPages: 5, totalRecords: 40 }),
});
