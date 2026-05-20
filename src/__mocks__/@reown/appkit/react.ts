const createAppKit = jest.fn();
const useAppKit = () => ({ open: jest.fn() });
const useAppKitState = jest.fn();
const useAppKitAccount = jest.fn(() => ({ isConnected: false }));
const useAppKitNetwork = jest.fn(() => ({ switchNetwork: jest.fn() }));
const useDisconnect = jest.fn(() => ({ disconnect: jest.fn() }));

export {
    createAppKit,
    useAppKit,
    useAppKitAccount,
    useAppKitNetwork,
    useAppKitState,
    useDisconnect,
};
