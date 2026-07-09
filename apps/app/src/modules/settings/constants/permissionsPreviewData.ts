import {
    type IDaoPlugin,
    Network,
    PluginInterfaceType,
} from '@/shared/api/daoService';
import type { IFilterComponentPlugin } from '@/shared/components/pluginFilterComponent';

/**
 * Self-contained "Patito DAO" preview identity used alongside
 * {@link permissionsMocks} when the `useMocks` flag is on, so the permissions
 * page renders the exact scenario from the Figma design (Patito DAO + a linked
 * Patito Developer DAO, with `Core` (SPP) and `Founders` (MULTISIG) plugins)
 * regardless of which DAO is opened. Ignored entirely for live data.
 */

/**
 * Minimal account shape the permissions list needs to build its tabs and resolve
 * `who` / `where` entities.
 */
export interface IPermissionsPreviewAccount {
    id: string;
    name: string;
    network: Network;
    daoAddress: string;
    avatarSrc?: string;
}

const patitoDaoAddress = '0xf204245b0B05E9A0780761E326552A569c1D6ceb';
const patitoDeveloperDaoAddress = '0x71C7656EC7ab88b098defB751B7401B5f6d8976F';
const coreAddress = '0x1eC50000000000000000000000000000000e8145';
const foundersAddress = '0xf00d00000000000000000000000000000000e845';

export const permissionsPreviewAccounts: IPermissionsPreviewAccount[] = [
    {
        id: 'patito-dao',
        name: 'Patito DAO',
        network: Network.ETHEREUM_MAINNET,
        daoAddress: patitoDaoAddress,
        avatarSrc: '/patitoDao.png',
    },
    {
        id: 'patito-developer-dao',
        name: 'Patito Developer DAO',
        network: Network.ETHEREUM_MAINNET,
        daoAddress: patitoDeveloperDaoAddress,
        avatarSrc: '/patitoDeveloperDao.png',
    },
];

export const permissionsPreviewPlugins: IFilterComponentPlugin<IDaoPlugin>[] = [
    {
        id: 'core',
        uniqueId: `${coreAddress}-spp`,
        label: 'Core',
        meta: {
            address: coreAddress,
            name: 'Core',
            interfaceType: PluginInterfaceType.SPP,
            release: '1',
            build: '3',
        } as IDaoPlugin,
        props: {},
    },
    {
        id: 'founders',
        uniqueId: `${foundersAddress}-multisig`,
        label: 'Founders',
        meta: {
            address: foundersAddress,
            name: 'Founders',
            interfaceType: PluginInterfaceType.MULTISIG,
            release: '1',
            build: '4',
        } as IDaoPlugin,
        props: {},
    },
];
