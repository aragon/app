const buildApprovedNamespaces = jest.fn();

const getSdkError = jest.fn((error: string) => error);

export { buildApprovedNamespaces, getSdkError };
