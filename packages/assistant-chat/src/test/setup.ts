// Setup testing-library DOM element matchers (e.g. toBeInTheDocument)
import '@testing-library/jest-dom';
import {
    ReadableStream,
    TextDecoderStream,
    TransformStream,
    WritableStream,
} from 'node:stream/web';
import { TextDecoder, TextEncoder } from 'node:util';
import { deserialize, serialize } from 'node:v8';

// Globally setup TextEncoder/TextDecoder needed by viem (pulled in through gov-ui-kit)
Object.assign(global, { TextDecoder, TextEncoder });

// jsdom does not implement web streams, required by the AI SDK's SSE parsing
Object.assign(global, {
    ReadableStream,
    TextDecoderStream,
    TransformStream,
    WritableStream,
});

// jsdom does not implement structuredClone, used by the AI SDK to snapshot message state
Object.assign(global, {
    structuredClone: (value: unknown) => deserialize(serialize(value)),
});

// Mock ResizeObserver functionality
global.ResizeObserver = jest.fn().mockImplementation(() => ({
    observe: jest.fn(),
    unobserve: jest.fn(),
    disconnect: jest.fn(),
}));

// jsdom does not implement scrollIntoView, used to follow the latest chat message
Element.prototype.scrollIntoView = jest.fn();

// jsdom does not implement the pointer-capture APIs Radix dialogs rely on
Element.prototype.hasPointerCapture = jest.fn();
Element.prototype.setPointerCapture = jest.fn();
Element.prototype.releasePointerCapture = jest.fn();

// jsdom does not implement matchMedia
Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: jest.fn().mockImplementation((query: string) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: jest.fn(),
        removeListener: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
    })),
});
