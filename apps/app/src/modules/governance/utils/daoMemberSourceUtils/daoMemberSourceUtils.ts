import type { IDao, IDaoPlugin } from '@/shared/api/daoService';
import { daoUtils } from '@/shared/utils/daoUtils';
import { pluginSortUtils } from '@/shared/utils/pluginSortUtils';

/**
 * A members tab: one body plugin, in the DAO that owns it. Safes are ordinary body plugins, so
 * every tab is backed by a canonical plugin record.
 */
export interface IDaoMemberSource {
    /** Registry id the member-list slot is resolved with. */
    id: string;
    /** Stable tab identity carried in the `members` URL parameter. */
    uniqueId: string;
    label: string;
    /** Address of the body plugin whose members are listed. */
    address: string;
    /** DAO owning the body plugin, which differs from the viewed DAO for linked accounts. */
    daoId: string;
    plugin: IDaoPlugin;
}

export interface IResolveDaoMemberSourcesParams {
    dao: IDao;
    daoId: string;
    bodyPlugins: IDaoPlugin[];
}

class DaoMemberSourceUtils {
    resolve = (params: IResolveDaoMemberSourcesParams): IDaoMemberSource[] => {
        const { bodyPlugins, dao, daoId } = params;

        const filterPlugins = bodyPlugins.map((plugin) => ({
            id: plugin.interfaceType,
            uniqueId: daoUtils.getPluginTabId(plugin, dao.address),
            label: daoUtils.getPluginName(plugin),
            meta: plugin,
            props: {},
        }));

        return pluginSortUtils
            .sortByDisplayOrder(filterPlugins, { rootDaoAddress: dao.address })
            .map(({ id, label, meta: plugin, uniqueId }) => ({
                id,
                uniqueId,
                label,
                address: plugin.address,
                daoId: daoUtils.resolvePluginDaoId(daoId, plugin, dao),
                plugin,
            }));
    };

    getMemberUrlFromDaoId = (
        daoId: string,
        memberAddress: string,
        memberSourceId: string,
    ): string => {
        const { network, address } = daoUtils.parseDaoId(daoId);
        const url = `/dao/${network}/${address}/members/${memberAddress}`;

        return `${url}?members=${encodeURIComponent(memberSourceId)}`;
    };

    getMemberUrl = (
        dao: IDao | undefined,
        memberAddress: string,
        memberSourceId?: string,
    ): string | undefined => {
        const url = daoUtils.getDaoUrl(dao, `members/${memberAddress}`);

        return url != null && memberSourceId != null
            ? `${url}?members=${encodeURIComponent(memberSourceId)}`
            : url;
    };

    getMemberListUrl = (
        dao: IDao | undefined,
        memberSourceId: string,
    ): string | undefined => {
        const url = daoUtils.getDaoUrl(dao, 'members');

        return url != null
            ? `${url}?members=${encodeURIComponent(memberSourceId)}`
            : undefined;
    };
}

export const daoMemberSourceUtils = new DaoMemberSourceUtils();
