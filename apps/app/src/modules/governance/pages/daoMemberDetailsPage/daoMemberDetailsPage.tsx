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
     * Address of the body plugin to read the membership under, defaulting to the first visible body of the DAO.
     *
     * Membership is plugin-scoped, so the plugin decides which voting power and token balance the page reports. The
     * `/dao/…` route does not name one — it has no way to — and takes the default; a caller that knows the
     * governance the member actually belongs to passes it, so the page does not report a body the member is not in.
     */
    bodyPluginAddress?: string;
}

/**
 * TODO: the fallbacks below build `/dao/…` URLs, which drop a reader who arrived through
 * `WorkspaceAccountMemberDetailsPage` out of the workspace — see the TODO on `DaoMembersPage`, where the three
 * exits are listed and fixed together.
 */
export const DaoMemberDetailsPage: React.FC<
    IDaoMemberDetailsPageProps
> = async (props) => {
    const { params, bodyPluginAddress } = props;
    const { address: rawAddress, addressOrEns, network } = await params;

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
        return <RedirectToUrl url={canonicalUrl} />;
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
    // Compared lowercased rather than through `addressUtils.isAddressEqual`, as the gov-ui-kit client shim breaks
    // in a server component — the same reason the address checks above come straight from viem.
    const normalizedBodyPluginAddress = bodyPluginAddress?.toLowerCase();

    // Falls back to the first body rather than failing on an address that names none: a governance that has since
    // been hidden, or that belongs to another DAO, must degrade to the default page instead of a dead end.
    const bodyPlugin =
        visibleBodyPlugins.find(
            (plugin) =>
                plugin.address.toLowerCase() === normalizedBodyPluginAddress,
        ) ?? visibleBodyPlugins[0];

    if (bodyPlugin == null) {
        const membersUrl = daoUtils.getDaoUrl(dao, 'members')!;
        return <RedirectToUrl url={membersUrl} />;
    }

    const token = (bodyPlugin.settings as unknown as Record<string, unknown>)
        .token as { address: string; network: string } | undefined;

    const memberUrlParams = { address };
    const memberQueryParams = {
        daoId,
        pluginAddress: bodyPlugin.address,
        tokenAddress: token?.address,
        network: token?.network,
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
                network={token?.network}
                pluginAddress={bodyPlugin.address}
                tokenAddress={token?.address}
            />
        </Page.Container>
    );
};
