import { PageRequest } from './PageRequest';

describe('PageRequest', () => {
  it('creates with valid props', () => {
    const page = PageRequest.create({ page: 1, pageSize: 20 });
    expect(page.page).toBe(1);
    expect(page.pageSize).toBe(20);
  });

  it('calculates offset', () => {
    const page = PageRequest.create({ page: 3, pageSize: 10 });
    expect(page.offset).toBe(20);
  });

  it('rejects invalid page', () => {
    expect(() => PageRequest.create({ page: 0, pageSize: 20 })).toThrow();
  });

  it('rejects pageSize over 250', () => {
    expect(() => PageRequest.create({ page: 1, pageSize: 300 })).toThrow();
  });
});
