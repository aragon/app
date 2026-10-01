import { SomethingWentWrong } from './SomethingWentWrong';

describe('SomethingWentWrong', () => {
  it('constructs an event carrying the originating Error', () => {
    const cause = new Error('boom');
    const event = new SomethingWentWrong(cause);

    expect(event.error).toBe(cause);
    expect(event.code).toBe('SomethingWentWrong');
    expect(event.occurredAt).toBeInstanceOf(Date);
  });

  it('exposes the static code on the class', () => {
    expect(SomethingWentWrong.code).toBe('SomethingWentWrong');
  });
});
