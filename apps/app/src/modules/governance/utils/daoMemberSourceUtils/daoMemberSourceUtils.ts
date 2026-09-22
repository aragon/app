import { safeBodyPluginId } from '@/plugins/safeMultisigPlugin/constants';
import type { ISppPluginSettings } from '@/plugins/sppPlugin/types';
import { VotingBodyBrandIdentity } from '@/plugins/sppPlugin/types';
import type { IDao, IDaoPlugin } from '@/shared/api/daoService';
import { PluginInterfaceType } from '@/shared/api/daoService';
import { daoUtils } from '@/shared/utils/daoUtils';
import { pluginSortUtils } from '@/shared/utils/pluginSortUtils';

export const safeMemberSourceIdPrefix = 'safe:';

interface IDaoMemberSourceBase {
    address: string;
    daoId: string;
    id: string;
    label: string;
    uniqueId: string;
}

export interface IDaoPluginMemberSource extends IDaoMemberSourceBase {
    kind: 'plugin';
    plugin: IDaoPlugin;
}

export interface IDaoSafeMemberSource extends IDaoMemberSourceBase {
    kind: 'safe';
}

export type IDaoMemberSource = IDaoPluginMemberSource | IDaoSafeMemberSource;

export interface IResolveDaoMemberSourcesParams {
    dao: IDao;
    daoId: string;
    bodyPlugins: IDaoPlugin[];
    processPlugins: IDaoPlugin[];
}

class DaoMemberSourceUtils {
    resolve = (params: IResolveDaoMemberSourcesParams): IDaoMemberSource[] => {
        const { bodyPlugins, dao, daoId, processPlugins } = params;
        const filterPlugins = bodyPlugins.map((plugin) => ({
            id: plugin.interfaceType,
            uniqueId: `${plugin.address}-${plugin.slug}`,
            label: daoUtils.getPluginName(plugin),
            meta: plugin,
            props: {},
        }));
        const sortedBodyPlugins = pluginSortUtils.sortByDisplayOrder(
            filterPlugins,
            { rootDaoAddress: dao.address },
        );
        const sources: IDaoMemberSource[] = sortedBodyPlugins.map(
            ({ id, label, meta: plugin, uniqueId }) => ({
                kind: 'plugin',
                id,
                uniqueId,
                label,
                address: plugin.address,
                daoId: daoUtils.resolvePluginDaoId(daoId, plugin, dao),
                plugin,
            }),
        );
        const safeSources = new Set<string>();

        for (const processPlugin of processPlugins) {
            if (processPlugin.interfaceType !== PluginInterfaceType.SPP) {
                continue;
            }

            const processDaoId = daoUtils.resolvePluginDaoId(
                daoId,
                processPlugin,
                dao,
            );
            const settings = processPlugin.settings as ISppPluginSettings;

            for (const stage of settings.stages ?? []) {
                for (const body of stage.plugins) {
                    if (
                        body.interfaceType != null ||
                        body.brandId !== VotingBodyBrandIdentity.SAFE
                    ) {
                        continue;
                    }
                    const uniqueId = this.getSafeSourceId(
                        processDaoId,
                        body.address,
                    );
                    if (safeSources.has(uniqueId)) {
                        continue;
                    }
                    safeSources.add(uniqueId);

                    sources.push({
                        kind: 'safe',
                        id: safeBodyPluginId,
                        uniqueId,
                        label: `Safe ${body.address.slice(0, 6)}…${body.address.slice(-4)}`,
                        address: body.address,
                        daoId: processDaoId,
                    });
                }
            }
        }

        return sources;
    };
    getSafeSourceId = (daoId: string, safeAddress: string): string =>
        `${safeMemberSourceIdPrefix}${daoId.toLowerCase()}:${safeAddress.toLowerCase()}`;

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
