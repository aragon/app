import { renderHook } from "@testing-library/react";
import { DateTime, Settings } from "luxon";
import { type IUseDefaultValuesProps, useDefaultValues } from "./useDefaultValues";

Settings.defaultZone = 'UTC';

describe('useDefaultValues', () => {
  const originalNow = DateTime.now;

  beforeEach(() => {
    DateTime.now = (() => DateTime.fromISO('2024-09-01T12:00:00.000Z')) as typeof DateTime.now;
  });

  afterEach(() => {
    DateTime.now = originalNow;
  });

  test('returns correct values when isNow is true', () => {
    const props: IUseDefaultValuesProps = { minDuration: 0, isNow: true };
    const { result } = renderHook(() => useDefaultValues(props));

    expect(result.current.dateTime).toEqual({
      date: '2024-09-01',
      time: '12:00',
    });
    expect(result.current.duration).toEqual({ days: 5, hours: 0, minutes: 0 });
  });

  test('returns correct values with startTime and minDuration', () => {
    const props: IUseDefaultValuesProps = {
      minDuration: 3600, // 1 hour
      startTime: { date: '2024-09-01', time: '10:00' },
      isNow: false,
    };
    const { result } = renderHook(() => useDefaultValues(props));

    expect(result.current.dateTime).toEqual({
      date: '2024-09-01',
      time: '11:00',
    });
    expect(result.current.duration).toEqual({ days: 0, hours: 1, minutes: 0 });
  });

  test('returns correct values with startTime and no minDuration', () => {
    const props: IUseDefaultValuesProps = {
      minDuration: 0,
      startTime: { date: '2024-09-01', time: '10:00' },
      isNow: false,
    };
    const { result } = renderHook(() => useDefaultValues(props));

    expect(result.current.dateTime).toEqual({
      date: '2024-09-06',
      time: '10:00',
    });
    expect(result.current.duration).toEqual({ days: 5, hours: 0, minutes: 0 });
  });

  test('returns correct values with minDuration and no startTime', () => {
    const props: IUseDefaultValuesProps = {
      minDuration: 7200, // 2 hours
      isNow: false,
    };
    const { result } = renderHook(() => useDefaultValues(props));

    expect(result.current.dateTime).toEqual({
      date: '2024-09-01',
      time: '14:00',
    });
    expect(result.current.duration).toEqual({ days: 0, hours: 2, minutes: 0 });
  });

  test('returns correct values with no minDuration and no startTime', () => {
    const props: IUseDefaultValuesProps = {
      minDuration: 0,
      isNow: false,
    };
    const { result } = renderHook(() => useDefaultValues(props));

    expect(result.current.dateTime).toEqual({
      date: '2024-09-06',
      time: '12:00',
    });
    expect(result.current.duration).toEqual({ days: 5, hours: 0, minutes: 0 });
  });
});
