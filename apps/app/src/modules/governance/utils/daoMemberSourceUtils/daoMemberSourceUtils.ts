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
        const filterPlugins = bodyPlugins
            .filter(
                ({ interfaceType }) =>
                    interfaceType !== PluginInterfaceType.SAFE,
            )
            .map((plugin) => ({
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
        const pushSafeSource = (sourceDaoId: string, safeAddress: string) => {
            const uniqueId = this.getSafeSourceId(sourceDaoId, safeAddress);
            if (safeSources.has(uniqueId)) {
                return;
            }
            safeSources.add(uniqueId);

            sources.push({
                kind: 'safe',
                id: PluginInterfaceType.SAFE,
                uniqueId,
                label: `Safe ${safeAddress.slice(0, 6)}…${safeAddress.slice(-4)}`,
                address: safeAddress,
                daoId: sourceDaoId,
            });
        };

        for (const bodyPlugin of bodyPlugins) {
            if (bodyPlugin.interfaceType !== PluginInterfaceType.SAFE) {
                continue;
            }

            pushSafeSource(
                daoUtils.resolvePluginDaoId(daoId, bodyPlugin, dao),
                bodyPlugin.address,
            );
        }

        for (const processPlugin of processPlugins) {
            const processDaoId = daoUtils.resolvePluginDaoId(
                daoId,
                processPlugin,
                dao,
            );

            // A Safe row can be both a process and a body. Every Safe identity contributes the same
            // deduped member source regardless of which backend collection returned it.
            if (processPlugin.interfaceType === PluginInterfaceType.SAFE) {
                pushSafeSource(processDaoId, processPlugin.address);
                continue;
            }

            if (processPlugin.interfaceType !== PluginInterfaceType.SPP) {
                continue;
            }

            const settings = processPlugin.settings as ISppPluginSettings;

            for (const stage of settings.stages ?? []) {
                for (const body of stage.plugins) {
                    if (
                        body.interfaceType != null ||
                        body.brandId !== VotingBodyBrandIdentity.SAFE
                    ) {
                        continue;
                    }
                    pushSafeSource(processDaoId, body.address);
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
