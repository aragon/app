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
}

export const DaoMemberDetailsPage: React.FC<
    IDaoMemberDetailsPageProps
> = async (props) => {
    const { params } = props;
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
    const bodyPlugin = visibleBodyPlugins[0];

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
