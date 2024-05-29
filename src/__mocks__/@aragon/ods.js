const lib = require('@aragon/ods');

const IconMock = ({ icon, ...otherProps }) => <svg data-testid={icon} {...otherProps} />;

module.exports = {
    ...lib,
    Icon: IconMock,
};
