const createAppKit = jest.fn();
const useAppKit = () => ({ open: jest.fn() });
const useAppKitState = jest.fn();

export { createAppKit, useAppKit, useAppKitState };
