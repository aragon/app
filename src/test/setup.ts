// Setup testing-library DOM element matchers (e.g. toBeInTheDocument)
// See full list of matchers here (https://github.com/testing-library/jest-dom?tab=readme-ov-file#custom-matchers)
import '@testing-library/jest-dom';
import 'jest-canvas-mock';
import { TextDecoder, TextEncoder } from 'util';
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

// Mock ResizeObserver functionality
global.ResizeObserver = jest
    .fn()
    .mockImplementation(() => ({ observe: jest.fn(), unobserve: jest.fn(), disconnect: jest.fn() }));

// Allow spying on library functions
jest.mock('react-hook-form', () => ({ __esModule: true, ...jest.requireActual<object>('react-hook-form') }));
jest.mock('viem', () => ({ __esModule: true, ...jest.requireActual<object>('viem') }));
