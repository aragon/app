// Setup testing-library DOM element matchers (e.g. toBeInTheDocument)
import '@testing-library/jest-dom';

// The fetch/Response/stream/encoding globals live on the jsdom global via the custom test
// environment (jsdomWithNode.js); only the jest-based DOM shims that jsdom lacks are set up here.

// Mock ResizeObserver functionality
global.ResizeObserver = jest.fn().mockImplementation(() => ({
    observe: jest.fn(),
    unobserve: jest.fn(),
    disconnect: jest.fn(),
}));

// jsdom does not implement scrollIntoView / scrollTo, used by the thread viewport to follow the
// latest message
Element.prototype.scrollIntoView = jest.fn();
Element.prototype.scrollTo = jest.fn();

// jsdom does not implement the pointer-capture APIs Radix dialogs rely on
Element.prototype.hasPointerCapture = jest.fn();
Element.prototype.setPointerCapture = jest.fn();
Element.prototype.releasePointerCapture = jest.fn();

// jsdom does not implement object URLs, used by the attachment tiles to preview local files
URL.createObjectURL = jest.fn(() => 'blob:mock-object-url');
URL.revokeObjectURL = jest.fn();

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
