/* eslint-disable no-console */
class TestLogger {
    private shouldSuppressErrors = false;
    private originalConsoleError = console.error;
    private originalConsoleWarn = console.warn;

    private testErrorLogger = jest.fn((...params) => {
        if (!this.shouldSuppressErrors) {
            if (params[1] === 'fetchPriority') {
                // Suppress "fetchPriority" React error until fixed on stable version
                // (See https://github.com/facebook/react/issues/27233)
                return;
            } else if (/`DialogContent` requires a `DialogTitle`/.test(params[0])) {
                // Suppress radix-ui error about title missing on Dialog component
                return;
            } else if (/`AlertDialogContent` requires a `AlertDialogTitle`/.test(params[0])) {
                // Suppress radix-ui error about title missing on AlertDialog component
                return;
            }

            this.originalConsoleError.apply(console, params);
        }
    });

    private testWarnLogger = jest.fn((...params) => {
        if (!this.shouldSuppressErrors) {
            if (/Missing `Description`/.test(params[0])) {
                // Suppress radix-ui error about description missing on Dialog component
                return;
            } else if (/`AlertDialogContent` requires a description/.test(params[0])) {
                // Suppress radix-ui error about description missing on AlertDialog component
                return;
            }

            this.originalConsoleWarn.apply(console, params);
        }
    });

    setup = () => {
        beforeEach(() => {
            console.error = this.testErrorLogger;
            console.warn = this.testWarnLogger;
        });

        afterEach(() => {
            this.shouldSuppressErrors = false;
            console.error = this.originalConsoleError;
            console.warn = this.originalConsoleWarn;
        });
    };

    suppressErrors = () => {
        this.shouldSuppressErrors = true;
    };
}

export const testLogger = new TestLogger();
