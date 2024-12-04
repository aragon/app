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
            } else if (
                typeof params[0] === 'string' &&
                params[0].includes('`DialogContent` requires a `DialogTitle`')
            ) {
                // Suppress radix-ui error about title missing on Dialog component
                return;
            }

            this.originalConsoleError.apply(console, params);
        }
    });

    private testWarnLogger = jest.fn((...params) => {
        if (!this.shouldSuppressErrors) {
            if (typeof params[0] === 'string' && params[0].includes('Missing `Description`')) {
                // Suppress radix-ui error about title missing on Dialog component
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
