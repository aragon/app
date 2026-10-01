import { UUID } from './UUID';

describe('UUID', () => {
  const validUUIDValue = '123e4567-e89b-12d3-a456-426614174000';
  const anotherValidUUIDValue = '123e4567-e89b-12d3-a456-426614174001';

  it('toString returns a lowercase string representation of the UUID', () => {
    const uuid = UUID.create({ uuidValue: validUUIDValue.toUpperCase() });
    expect(uuid.toString()).toBe(validUUIDValue.toLowerCase());
  });

  describe('equals method', () => {
    it('returns true for UUIDs with the same value', () => {
      const uuid1 = UUID.create({ uuidValue: validUUIDValue });
      const uuid2 = UUID.create({ uuidValue: validUUIDValue });
      expect(uuid1.equals(uuid2)).toBe(true);
    });

    it('returns false for UUIDs with different values', () => {
      const uuid1 = UUID.create({ uuidValue: validUUIDValue });
      const uuid2 = UUID.create({ uuidValue: anotherValidUUIDValue });
      expect(uuid1.equals(uuid2)).toBe(false);
    });
  });

  describe('create method', () => {
    it('creates a UUID instance with valid props', () => {
      const uuid = UUID.create({ uuidValue: validUUIDValue });
      expect(uuid).toBeInstanceOf(UUID);
      expect(uuid.toString()).toBe(validUUIDValue.toLowerCase());
    });

    it('throws an error with invalid props', () => {
      expect(() => UUID.create({ uuidValue: 'invalid-uuid' })).toThrow();
    });
  });
});
