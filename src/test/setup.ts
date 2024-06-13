// Setup testing-library DOM element matchers (e.g. toBeInTheDocument)
// See full list of matchers here (https://github.com/testing-library/jest-dom?tab=readme-ov-file#custom-matchers)
import '@testing-library/jest-dom';
import { TextDecoder, TextEncoder } from 'util';
import { mockFetch, mockTranslations, testLogger } from './utils';

// Setup test logger
testLogger.setup();

// Mock global fetch
mockFetch();

// Setup test translations
mockTranslations.setup();

// Globally setup TextEncoder/TextDecoder needed by viem
Object.assign(global, { TextDecoder, TextEncoder });

// Mock ResideObserver functionality
global.ResizeObserver = jest.fn().mockImplementation(() => ({ observe: jest.fn(), disconnect: jest.fn() }));
