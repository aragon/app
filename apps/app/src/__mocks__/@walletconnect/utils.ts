const buildApprovedNamespaces = jest.fn();

const getSdkError = jest.fn((error: string) => error);

// Extracts the pairing topic from a `wc:<topic>@<version>?<params>` URI.
const parseUri = jest.fn((uri: string) => ({
    topic: uri.replace('wc:', '').split('@')[0],
}));

export { buildApprovedNamespaces, getSdkError, parseUri };
