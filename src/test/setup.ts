// Setup testing-library DOM element matchers (e.g. toBeInTheDocument)
// See full list of matchers here (https://github.com/testing-library/jest-dom?tab=readme-ov-file#custom-matchers)
import '@testing-library/jest-dom';
import 'jest-canvas-mock';
import { TextDecoder, TextEncoder } from 'node:util';
import { deserialize, serialize } from 'node:v8';
import { mockFetch, mockTranslations, testLogger, timeUtils } from './utils';

// Setup test logger
testLogger.setup();

// Mock global fetch
mockFetch();

// Setup test translations
mockTranslations.setup();

// Setup test times
timeUtils.setup();

// Globally setup TextEncoder/TextDecoder needed by viem
Object.assign(global, { TextDecoder, TextEncoder });

// jsdom does not expose structuredClone, which @dagrejs/dagre relies on during
// graph layout. Back it with v8 serialization for a faithful structured clone.
if (typeof globalThis.structuredClone !== 'function') {
    globalThis.structuredClone = <T>(value: T): T =>
        deserialize(serialize(value)) as T;
}

// Mock ResizeObserver functionality
global.ResizeObserver = jest.fn().mockImplementation(() => ({
    observe: jest.fn(),
    unobserve: jest.fn(),
    disconnect: jest.fn(),
}));

// jsdom does not implement elementFromPoint, which TipTap's placeholder viewport
// tracking relies on when mounting the editor.
if (
    typeof document !== 'undefined' &&
    typeof document.elementFromPoint !== 'function'
) {
    document.elementFromPoint = () => null;
}

// Allow spying on library functions
jest.mock('react-hook-form', () => ({
    __esModule: true,
    ...jest.requireActual<object>('react-hook-form'),
}));
jest.mock('viem', () => ({
    __esModule: true,
    ...jest.requireActual<object>('viem'),
}));
jest.mock('next/font/local', () => ({
    __esModule: true,
    default: () => ({ className: '' }),
}));
