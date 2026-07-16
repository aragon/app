import { observability } from '../lib/observability';

// The observability transport is stdout/stderr JSON — silence it in tests so the jest output
// stays readable. Tests that care about logging can re-mock with their own implementation.
jest.spyOn(observability, 'logStep').mockImplementation(() => undefined);
jest.spyOn(observability, 'logError').mockImplementation(() => undefined);

// Treat unexpected stderr as a test failure. Expected errors must opt in with
// `mockImplementationOnce`, which keeps error paths explicit and prevents noisy passing suites.
jest.spyOn(console, 'error').mockImplementation((...args: unknown[]) => {
    const message = args
        .map((value) =>
            value instanceof Error
                ? `${value.name}: ${value.message}`
                : String(value),
        )
        .join(' ');

    throw new Error(`Unexpected console.error: ${message}`);
});
