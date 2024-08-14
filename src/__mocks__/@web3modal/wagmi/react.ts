const createWeb3Modal = jest.fn();
const useWeb3Modal = () => ({ open: jest.fn() });

export { createWeb3Modal, useWeb3Modal };
