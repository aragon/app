import assert from 'node:assert';
import { ZodString } from 'zod';

const hexStringRegex = /^0x[a-fA-F0-9]*$/;

export type HexString = `0x${string}`;

export function hexString() {
  return ZodString.create().refine(
    (data): data is HexString => hexStringRegex.test(data),
    {
      message: 'Invalid hex string',
    },
  );
}

export function assertHexString(
  data: unknown,
  message?: string,
): asserts data is HexString {
  assert(typeof data === 'string', 'Data must be a string');
  if (!hexStringRegex.test(data)) {
    throw new Error(message ?? 'Invalid hex string');
  }
}
