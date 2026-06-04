import { MemberProfileTextRecord } from './MemberProfileTextRecord';

describe('MemberProfileTextRecord', () => {
  it('creates a valid text record', () => {
    const record = MemberProfileTextRecord.create({
      key: 'avatar',
      value: 'ipfs://bafy…',
    });
    expect(record.key).toBe('avatar');
    expect(record.value).toBe('ipfs://bafy…');
  });

  it('allows an empty value string', () => {
    const record = MemberProfileTextRecord.create({ key: 'bio', value: '' });
    expect(record.value).toBe('');
  });

  it('rejects an empty key', () => {
    expect(() =>
      MemberProfileTextRecord.create({ key: '', value: 'x' }),
    ).toThrow();
  });

  it('structural equality', () => {
    const a = MemberProfileTextRecord.create({ key: 'avatar', value: 'x' });
    const b = MemberProfileTextRecord.create({ key: 'avatar', value: 'x' });
    expect(a.equals(b)).toBe(true);
  });

  it('structural inequality when value differs', () => {
    const a = MemberProfileTextRecord.create({ key: 'avatar', value: 'x' });
    const b = MemberProfileTextRecord.create({ key: 'avatar', value: 'y' });
    expect(a.equals(b)).toBe(false);
  });
});
