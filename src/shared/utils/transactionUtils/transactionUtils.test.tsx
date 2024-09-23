import { transactionUtils } from './transactionUtils';

describe('transaction utils', () => {
    describe('cidToHex', () => {
        it('parses the metadata cid to hex format', () => {
            const metadataCid = 'QmT8PDLFQDWaAUoKw4BYziWQNVKChJY3CGi5eNpECi7ufD';
            const expectedValue =
                '0x697066733a2f2f516d543850444c465144576141556f4b773442597a6957514e564b43684a593343476935654e7045436937756644';
            expect(transactionUtils.cidToHex(metadataCid)).toEqual(expectedValue);
        });
    });
});
