import {
    deleteDeviceShare,
    hasDeviceShare,
    type IDeviceShareRecord,
    loadDeviceShare,
    saveDeviceShare,
} from './deviceShareStorage';

describe('deviceShareStorage utils (localStorage fallback)', () => {
    const record: IDeviceShareRecord = {
        systemId: 'system-1',
        epoch: 1,
        salt: '0x0102',
        iv: '0x0304',
        ciphertext: '0x0506',
        createdAt: '2026-01-01T00:00:00.000Z',
    };

    beforeEach(() => {
        localStorage.clear();
    });

    it('uses localStorage when indexedDB is not available', async () => {
        expect(typeof indexedDB).toBe('undefined');
        await saveDeviceShare(record);
        expect(
            localStorage.getItem('aragon-mpc-poc:deviceShare:system-1'),
        ).not.toBeNull();
    });

    it('saves and loads a device share', async () => {
        await saveDeviceShare(record);
        expect(await loadDeviceShare('system-1')).toEqual(record);
        expect(await hasDeviceShare('system-1')).toBe(true);
    });

    it('returns undefined for unknown systems', async () => {
        expect(await loadDeviceShare('unknown')).toBeUndefined();
        expect(await hasDeviceShare('unknown')).toBe(false);
    });

    it('overwrites an existing record', async () => {
        await saveDeviceShare(record);
        await saveDeviceShare({ ...record, epoch: 2 });
        expect((await loadDeviceShare('system-1'))?.epoch).toBe(2);
    });

    it('deletes a device share', async () => {
        await saveDeviceShare(record);
        await deleteDeviceShare('system-1');
        expect(await hasDeviceShare('system-1')).toBe(false);
    });
});
