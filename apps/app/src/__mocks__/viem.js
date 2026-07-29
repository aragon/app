const viem = require('viem');

// Mock the getAddress function from viem as it requires client side dependencies
// (see https://github.com/paralleldrive/cuid2/issues/44)
const getAddressMock = (address) => address;

module.exports = { ...viem, getAddress: getAddressMock };
