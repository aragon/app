export interface ISerializedError {
    name?: string;
    message?: string;
    stack?: string;
    code?: string;
    status?: number;
    description?: string;
    cause?: ISerializedError;
}

/**
 * Utility class for safe error serialization.
 */
class ErrorUtils {
    private readonly maxCauseDepth = 10;

    /**
     * Safely extracts serializable properties from an error object.
     * Filters out DOM elements, functions, and circular references.
     *
     * Use this instead of `JSON.parse(JSON.stringify(error))` to avoid
     * "Converting circular structure to JSON" errors when the error
     * contains DOM element references (e.g., from React hydration errors
     * or Next.js metadata API errors).
     */
    serialize = (error: unknown): ISerializedError => {
        return this.serializeInternal(error, new WeakSet<object>(), 0);
    };

    private serializeInternal = (
        error: unknown,
        seen: WeakSet<object>,
        depth: number,
    ): ISerializedError => {
        if (error == null) {
            return {};
        }

        // Handle primitives
        if (typeof error !== 'object') {
            return { message: String(error) };
        }

        // Prevent infinite recursion from circular references
        if (seen.has(error) || depth >= this.maxCauseDepth) {
            return {};
        }
        seen.add(error);

        const result: ISerializedError = {};
        const err = error as Record<string, unknown>;

        // Safely copy standard error properties
        if (typeof err.name === 'string') {
            result.name = err.name;
        }
        if (typeof err.message === 'string') {
            result.message = err.message;
        }
        if (typeof err.stack === 'string') {
            result.stack = err.stack;
        }

        // Copy custom error properties (e.g., from AragonBackendServiceError)
        if (typeof err.code === 'string') {
            result.code = err.code;
        }
        if (typeof err.status === 'number') {
            result.status = err.status;
        }
        if (typeof err.description === 'string') {
            result.description = err.description;
        }

        // Recursively handle cause (Error.cause from ES2022)
        if (err.cause != null) {
            result.cause = this.serializeInternal(err.cause, seen, depth + 1);
        }

        return result;
    };
}

export const errorUtils = new ErrorUtils();
