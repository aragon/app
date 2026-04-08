import { addressUtils } from '@aragon/gov-ui-kit';
import { useMemo } from 'react';
import type { IFeaturedDelegates } from '@/shared/api/cmsService';
import { type IDaoPlugin, useDao } from '@/shared/api/daoService';
import { useDaoPlugins } from '@/shared/hooks/useDaoPlugins';
import { PluginType } from '@/shared/types';
import type { ITokenMemberListPluginSettings } from '../../components/tokenMemberList/tokenMemberListBase';

export interface IUseFeaturedDelegatesPluginParams {
    /**
     * ID of the DAO to resolve featured delegates for.
     */
    daoId: string;
    /**
     * Featured delegates config from CMS.
     */
    featuredDelegates: IFeaturedDelegates[];
}

export type IUseFeaturedDelegatesPluginResult =
    | {
          hasFeaturedDelegates: true;
          featuredDelegatesConfig: IFeaturedDelegates;
          featuredDelegatesPlugin: IDaoPlugin<ITokenMemberListPluginSettings>;
      }
    | {
          hasFeaturedDelegates: false;
          featuredDelegatesConfig: undefined;
          featuredDelegatesPlugin: undefined;
      };

function isTokenVotingPlugin(
    plugin: IDaoPlugin,
): plugin is IDaoPlugin<ITokenMemberListPluginSettings> {
    return 'token' in plugin.settings;
}

const noResult: IUseFeaturedDelegatesPluginResult = {
    hasFeaturedDelegates: false,
    featuredDelegatesConfig: undefined,
    featuredDelegatesPlugin: undefined,
};

/**
 * Resolves the featured delegates configuration and the corresponding token
 * voting plugin for the given DAO.
 */
export const useFeaturedDelegatesPlugin = (
    params: IUseFeaturedDelegatesPluginParams,
): IUseFeaturedDelegatesPluginResult => {
    const { daoId, featuredDelegates } = params;

    const { data: dao } = useDao({ urlParams: { id: daoId } });

    const featuredDelegatesConfig = useMemo(
        () =>
            dao == null
                ? undefined
                : featuredDelegates.find(
                      (config) =>
                          addressUtils.isAddressEqual(
                              config.daoAddress,
                              dao.address,
                          ) && config.network === dao.network,
                  ),
        [featuredDelegates, dao],
    );

    const bodyPlugins = useDaoPlugins({
        daoId,
        type: PluginType.BODY,
        pluginAddress: featuredDelegatesConfig?.pluginAddress,
        includeSubPlugins: true,
    });

    return useMemo(() => {
        if (
            featuredDelegatesConfig == null ||
            featuredDelegatesConfig.delegates.length === 0 ||
            bodyPlugins == null
        ) {
            return noResult;
        }

        const match = bodyPlugins.find((p) =>
            addressUtils.isAddressEqual(
                p.meta.address,
                featuredDelegatesConfig.pluginAddress,
            ),
        );

        if (match == null || !isTokenVotingPlugin(match.meta)) {
            return noResult;
        }

        return {
            hasFeaturedDelegates: true,
            featuredDelegatesConfig,
            featuredDelegatesPlugin: match.meta,
        };
    }, [featuredDelegatesConfig, bodyPlugins]);
};
