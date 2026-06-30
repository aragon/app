import { permissionNameUtils } from './permissionNameUtils';

describe('permissionNameUtils', () => {
    describe('getPermissionName', () => {
        it.each([
            {
                permissionId:
                    '0x815fe80e4b37c8582a3b773d1d7071f983eacfd56b5965db654f3087c25ada33',
                expected: 'Root',
            },
            {
                permissionId:
                    '0x8c433a4cd6b51969eca37f974940894297b9fcf4b282a213fea5cd8f85289c90',
                expected: 'Create proposal',
            },
            {
                permissionId:
                    '0xbf04b4486c9663d805744005c3da000eda93de6e3308a4a7a812eb565327b78d',
                expected: 'Execute',
            },
            {
                permissionId:
                    '0x821b6e3a557148015a918c89e5d092e878a69854a2d1a410635f771bd5a8a3f5',
                expected: 'Upgrade plugin',
            },
            {
                permissionId:
                    '0x485a22b473de7ee3091c71c5ce05019fd1466a1650b1228784a9bcd5b7bed510',
                expected: 'Manage selectors',
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
                expected: '0x0123…cdef',
            },
            {
                permissionId:
                    '0xdeadbeef00000000000000000000000000000000000000000000000000001234',
                expected: '0xdead…1234',
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
                expected: 'Root',
            },
            {
                permissionId:
                    '0xBF04B4486C9663D805744005C3DA000EDA93DE6E3308A4A7A812EB565327B78D',
                expected: 'Execute',
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
