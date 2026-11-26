const WalletKit = { init: jest.fn(() => Promise.resolve({ on: jest.fn() })) };

export { WalletKit };
