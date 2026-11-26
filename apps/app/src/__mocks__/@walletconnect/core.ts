// Fresh core without any known pairing.
const Core = jest.fn(() => ({ pairing: { getPairings: jest.fn(() => []) } }));

export { Core };
