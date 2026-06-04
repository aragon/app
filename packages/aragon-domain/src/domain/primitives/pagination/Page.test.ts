import { createPage } from './Page';

describe('createPage', () => {
  it('builds a Page<T> from items and totals', () => {
    const items = ['a', 'b', 'c'];
    const page = createPage(items, 1, 10, 23);

    expect(page).toEqual({
      items,
      page: 1,
      pageSize: 10,
      totalPages: 3,
      totalRecords: 23,
    });
  });

  it('rounds totalPages up for partial final pages', () => {
    const page = createPage([], 1, 7, 15);
    expect(page.totalPages).toBe(3);
  });

  it('produces 0 totalPages when there are no records', () => {
    const page = createPage([], 1, 10, 0);
    expect(page.totalPages).toBe(0);
  });
});
