import { QueryClient } from '@tanstack/react-query';
// biome-ignore lint/style/noRestrictedImports: server component cannot use the gov-ui-kit client shim; called with { strict: false } below.
import { getAddress, isAddress } from 'viem';
import { daoOverridesOptions } from '@/shared/api/cmsService';
import { daoService, PluginInterfaceType } from '@/shared/api/daoService';
import { Page } from '@/shared/components/page';
import { RedirectToUrl } from '@/shared/components/redirectToUrl';
import { PluginType } from '@/shared/types';
import { daoUtils } from '@/shared/utils/daoUtils';
import { daoVisibilityUtils } from '@/shared/utils/daoVisibilityUtils';
import { memberOptions } from '../../api/governanceService';
import type { IDaoMemberPageParams } from '../../types';
import { daoMemberSourceUtils } from '../../utils/daoMemberSourceUtils';
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
}

export const DaoMemberDetailsPage: React.FC<
    IDaoMemberDetailsPageProps
> = async (props) => {
    const { params, searchParams } = props;
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
        const selectedSourceQuery =
            selectedSourceId != null
                ? `?members=${encodeURIComponent(selectedSourceId)}`
                : '';
        const canonicalUrl = `/dao/${network}/${addressOrEns}/members/${address}${selectedSourceQuery}`;
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
    const processPlugins =
        daoUtils.getDaoPlugins(dao, {
            interfaceType: PluginInterfaceType.SPP,
            includeSubPlugins: true,
            includeLinkedAccounts: true,
        }) ?? [];
    const memberSources = daoMemberSourceUtils.resolve({
        dao,
        daoId,
        bodyPlugins: visibleBodyPlugins,
        processPlugins,
    });
    const memberSource =
        memberSources.find(({ uniqueId }) => uniqueId === selectedSourceId) ??
        memberSources[0];

    if (memberSource == null) {
        const membersUrl = daoUtils.getDaoUrl(dao, 'members')!;
        return <RedirectToUrl url={membersUrl} />;
    }

    const token =
        memberSource.kind === 'plugin'
            ? (
                  memberSource.plugin.settings as unknown as Record<
                      string,
                      unknown
                  >
              ).token
            : undefined;
    const tokenInfo = token as { address: string; network: string } | undefined;

    const memberUrlParams = { address };
    const memberQueryParams = {
        daoId: memberSource.daoId,
        pluginAddress: memberSource.address,
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
                memberDaoId={memberSource.daoId}
                memberSourceId={memberSource.uniqueId}
                network={tokenInfo?.network}
                pluginAddress={memberSource.address}
                tokenAddress={tokenInfo?.address}
            />
        </Page.Container>
    );
};
