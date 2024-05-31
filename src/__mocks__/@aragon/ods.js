const lib = require('@aragon/ods');

// Use custom implementation for the <Icon /> and <AvatarIcon /> components of the @aragon/ods library to simplify
// testing the presence of icons through their icon identifier.
const IconMock = ({ icon, ...otherProps }) => <svg data-testid={icon} {...otherProps} />;

module.exports = {
    ...lib,
    Icon: IconMock,
    AvatarIcon: IconMock,
};
