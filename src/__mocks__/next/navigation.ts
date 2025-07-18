const usePathname = jest.fn();
const useRouter = jest.fn();
const useSearchParams = jest.fn(() => new URLSearchParams());

export { usePathname, useRouter, useSearchParams };
