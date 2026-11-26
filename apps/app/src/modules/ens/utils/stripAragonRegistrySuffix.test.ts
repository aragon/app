import { stripAragonRegistrySuffix } from './stripAragonRegistrySuffix';

describe('stripAragonRegistrySuffix', () => {
    it('strips the registry suffix', () => {
        expect(stripAragonRegistrySuffix('alice.aragon.eth')).toBe('alice');
    });

    it.each(['vitalik.eth', 'aragon.eth', 'alice.aragon.eth.xyz'])(
        'keeps %s in full',
        (name) => {
            expect(stripAragonRegistrySuffix(name)).toBe(name);
        },
    );

    it('passes through a missing name', () => {
        expect(stripAragonRegistrySuffix(undefined)).toBeUndefined();
        expect(stripAragonRegistrySuffix(null)).toBeNull();
    });
});
