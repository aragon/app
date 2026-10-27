import { QueryClient } from '@tanstack/react-query';
// biome-ignore lint/style/noRestrictedImports: server component cannot use the gov-ui-kit client shim; called with { strict: false } below.
import { getAddress, isAddress } from 'viem';
import { daoOverridesOptions } from '@/shared/api/cmsService';
import { daoService } from '@/shared/api/daoService';
import { Page } from '@/shared/components/page';
import { RedirectToUrl } from '@/shared/components/redirectToUrl';
import { PluginType } from '@/shared/types';
import { daoUtils } from '@/shared/utils/daoUtils';
import { daoVisibilityUtils } from '@/shared/utils/daoVisibilityUtils';
import { memberOptions } from '../../api/governanceService';
import type { IDaoMemberPageParams } from '../../types';
import { DaoMemberDetailsPageClient } from './daoMemberDetailsPageClient';

export interface IDaoMemberDetailsPageProps {
    /**
     * DAO member page parameters.
     */
    params: Promise<IDaoMemberPageParams>;
    /**
     * Member source selected on the members page.
     */
    searchParams?: Promise<Record<string, string | string[] | undefined>>;
    /**
     * Body plugin to read the membership under, defaulting to the first visible body of the DAO. Either its filter
     * identifier — what the `vote` search parameter of the page carries — or its plain address.
     *
     * Membership is plugin-scoped, so the plugin decides which voting power and token balance the page reports. The
     * `/dao/…` route does not name one — it has no way to — and takes the default; a caller that knows the
     * governance the member actually belongs to passes it, so the page does not report a body the member is not in.
     */
    bodyPluginId?: string;
}

/**
 * TODO: the fallbacks below build `/dao/…` URLs, which drop a reader who arrived through
 * `WorkspaceAccountMemberDetailsPage` out of the workspace — see the TODO on `DaoMembersPage`, where the three
 * exits are listed and fixed together.
 */
export const DaoMemberDetailsPage: React.FC<
    IDaoMemberDetailsPageProps
> = async (props) => {
    const { params, searchParams, bodyPluginId } = props;
    const pageParams = await params;
    const memberSearchParams: Record<string, string | string[] | undefined> =
        searchParams != null ? await searchParams : {};
    const { address: rawAddress, addressOrEns, network } = pageParams;
    const selectedSourceParam = memberSearchParams.members;
    const selectedSourceId = Array.isArray(selectedSourceParam)
        ? selectedSourceParam[0]
        : selectedSourceParam;

    if (!isAddress(rawAddress, { strict: false })) {
        const errorNamespace = 'app.governance.daoMemberDetailsPage.error';
        const actionLink = `/dao/${network}/${addressOrEns}/members`;

        return (
            <Page.Error
                actionLink={actionLink}
                error={{ name: 'InvalidAddress', message: rawAddress }}
                errorNamespace={errorNamespace}
            />
        );
    }

    const address = getAddress(rawAddress);

    if (address !== rawAddress) {
        const canonicalUrl = `/dao/${network}/${addressOrEns}/members/${address}`;
        return (
            <RedirectToUrl
                url={daoUtils.withMemberTab(canonicalUrl, selectedSourceId)!}
            />
        );
    }

    const daoId = await daoUtils.resolveDaoId({ addressOrEns, network });
    const dao = await daoService.getDao({ urlParams: { id: daoId } });

    const queryClient = new QueryClient();

    const daoOverrides = await queryClient.fetchQuery(daoOverridesOptions());
    const daoOverride = daoOverrides[daoId];

    const allBodyPlugins =
        daoUtils.getDaoPlugins(dao, {
            type: PluginType.BODY,
            includeSubPlugins: true,
            includeLinkedAccounts: true,
        }) ?? [];
    const visibleBodyPlugins = daoVisibilityUtils.filterHiddenPlugins(
        allBodyPlugins,
        daoOverride,
    );

    // TODO: reconcile bodyPluginId and search params approach
    const bodyPluginBySourceId = visibleBodyPlugins.find(
        (plugin) =>
            daoUtils.getPluginTabId(plugin, dao.address) === selectedSourceId,
    );

    const normalizedBodyPluginId = bodyPluginId?.toLowerCase();

    // Falls back to the first body rather than failing on an invalid value like hidden body
    const bodyPluginByBodyPluginId = visibleBodyPlugins.find(
        (plugin) =>
            plugin.address.toLowerCase() === normalizedBodyPluginId ||
            daoUtils.buildPluginUniqueId(plugin).toLowerCase() ===
                normalizedBodyPluginId,
    );

    const bodyPlugin =
        bodyPluginByBodyPluginId ??
        bodyPluginBySourceId ??
        visibleBodyPlugins[0];

    if (bodyPlugin == null) {
        const membersUrl = daoUtils.getDaoUrl(dao, 'members')!;
        return <RedirectToUrl url={membersUrl} />;
    }

    // A body need not carry settings at all (a Safe has none), so this stays optional.
    const token = (
        bodyPlugin.settings as unknown as Record<string, unknown> | undefined
    )?.token;
    const tokenInfo = token as { address: string; network: string } | undefined;
    const memberDaoId = daoUtils.resolvePluginDaoId(daoId, bodyPlugin, dao);

    const memberUrlParams = { address };
    const memberQueryParams = {
        daoId: memberDaoId,
        pluginAddress: bodyPlugin.address,
        tokenAddress: tokenInfo?.address,
        network: tokenInfo?.network,
    };
    const memberParams = {
        urlParams: memberUrlParams,
        queryParams: memberQueryParams,
    };

    await queryClient
        .fetchQuery(memberOptions(memberParams))
        .catch(() => undefined);

    return (
        <Page.Container queryClient={queryClient}>
            <DaoMemberDetailsPageClient
                address={address}
                daoId={daoId}
                memberDaoId={memberDaoId}
                memberSourceId={daoUtils.getPluginTabId(
                    bodyPlugin,
                    dao.address,
                )}
                network={tokenInfo?.network}
                pluginAddress={bodyPlugin.address}
                tokenAddress={tokenInfo?.address}
            />
        </Page.Container>
    );
};
