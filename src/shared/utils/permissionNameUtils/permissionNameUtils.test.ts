import { permissionNameUtils } from './permissionNameUtils';

describe('permissionNameUtils', () => {
    describe('getPermissionName', () => {
        it.each([
            {
                permissionId:
                    '0x815fe80e4b37c8582a3b773d1d7071f983eacfd56b5965db654f3087c25ada33',
                expected: 'ROOT_PERMISSION',
            },
            {
                permissionId:
                    '0x8c433a4cd6b51969eca37f974940894297b9fcf4b282a213fea5cd8f85289c90',
                expected: 'CREATE_PROPOSAL_PERMISSION',
            },
            {
                permissionId:
                    '0xbf04b4486c9663d805744005c3da000eda93de6e3308a4a7a812eb565327b78d',
                expected: 'EXECUTE_PERMISSION',
            },
            {
                permissionId:
                    '0x821b6e3a557148015a918c89e5d092e878a69854a2d1a410635f771bd5a8a3f5',
                expected: 'UPGRADE_PLUGIN_PERMISSION',
            },
            {
                permissionId:
                    '0x485a22b473de7ee3091c71c5ce05019fd1466a1650b1228784a9bcd5b7bed510',
                expected: 'MANAGE_SELECTORS_PERMISSION',
            },
            {
                permissionId:
                    '0xb737b436e6cc542520cb79ec04245c720c38eebfa56d9e2d99b043979db20e4c',
                expected: 'MINT_PERMISSION',
            },
            {
                permissionId:
                    '0x595f29b9b81abb2cfafd1caa277c849a6317ded4aa7672cd5e076bacaf78ba3e',
                expected: 'PAUSE_PERMISSION',
            },
            {
                permissionId:
                    '0x9c81fc3cf68d43a5ff1c09ddb652dc0e85041298a2c6bb91eec4ba1dabf138bb',
                expected: 'BURN_PERMISSION',
            },
        ])('maps the known hash $permissionId to "$expected"', ({
            permissionId,
            expected,
        }) => {
            expect(permissionNameUtils.getPermissionName(permissionId)).toEqual(
                expected,
            );
        });

        it.each([
            {
                permissionId:
                    '0x0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef',
                expected: '0x01234567…89abcdef',
            },
            {
                permissionId:
                    '0xdeadbeef00000000000000000000000000000000000000000000000000001234',
                expected: '0xdeadbeef…00001234',
            },
        ])('returns the truncated fallback $expected for the unmapped hash $permissionId', ({
            permissionId,
            expected,
        }) => {
            expect(permissionNameUtils.getPermissionName(permissionId)).toEqual(
                expected,
            );
        });

        it.each([
            {
                permissionId:
                    '0x815FE80E4B37C8582A3B773D1D7071F983EACFD56B5965DB654F3087C25ADA33',
                expected: 'ROOT_PERMISSION',
            },
            {
                permissionId:
                    '0xBF04B4486C9663D805744005C3DA000EDA93DE6E3308A4A7A812EB565327B78D',
                expected: 'EXECUTE_PERMISSION',
            },
        ])('resolves known hashes case-insensitively for $permissionId', ({
            permissionId,
            expected,
        }) => {
            expect(permissionNameUtils.getPermissionName(permissionId)).toEqual(
                expected,
            );
        });
    });
});
