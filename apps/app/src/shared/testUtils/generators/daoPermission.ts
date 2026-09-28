import {
    type IDaoPermission,
    type IPermissionEntityRef,
    Network,
} from '@/shared/api/daoService';

const DEFAULT_WHO_ADDRESS = '0x1111111111111111111111111111111111111111';
const DEFAULT_WHERE_ADDRESS = '0x2222222222222222222222222222222222222222';
const DEFAULT_CONDITION_ADDRESS = '0x3333333333333333333333333333333333333333';

export const generatePermissionEntityRef = (
    entity?: Partial<IPermissionEntityRef>,
): IPermissionEntityRef => ({
    address: DEFAULT_WHO_ADDRESS,
    layer: 'unknown',
    ...entity,
});

export const generateDaoPermission = (
    daoPermission?: Partial<IDaoPermission>,
): IDaoPermission => ({
    permissionId: '0xPermissionId',
    whoAddress: DEFAULT_WHO_ADDRESS,
    whereAddress: DEFAULT_WHERE_ADDRESS,
    conditionAddress: DEFAULT_CONDITION_ADDRESS,
    condition: { conditionType: 'unknown' },
    conditionEntity: generatePermissionEntityRef({
        address: DEFAULT_CONDITION_ADDRESS,
        layer: 'condition',
    }),
    network: Network.ETHEREUM_MAINNET,
    who: generatePermissionEntityRef({ address: DEFAULT_WHO_ADDRESS }),
    where: generatePermissionEntityRef({ address: DEFAULT_WHERE_ADDRESS }),
    ...daoPermission,
});
