const createWeb3Modal = jest.fn();
const useWeb3Modal = () => ({ open: jest.fn() });
const useWeb3ModalState = jest.fn();

export { createWeb3Modal, useWeb3Modal, useWeb3ModalState };
