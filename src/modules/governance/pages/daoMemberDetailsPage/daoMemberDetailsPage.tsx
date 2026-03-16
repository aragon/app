import { QueryClient } from '@tanstack/react-query';
import { daoOverridesOptions } from '@/modules/explore/api/cmsService';
import { daoService } from '@/shared/api/daoService';
import { Page } from '@/shared/components/page';
import { RedirectToUrl } from '@/shared/components/redirectToUrl';
import { PluginType } from '@/shared/types';
import { daoUtils } from '@/shared/utils/daoUtils';
import { daoVisibilityUtils } from '@/shared/utils/daoVisibilityUtils';
import { errorUtils } from '@/shared/utils/errorUtils';
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
    const { address, addressOrEns, network } = await params;
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

    const memberUrlParams = { address };
    const memberQueryParams = {
        daoId,
        pluginAddress: bodyPlugin.address,
    };
    const memberParams = {
        urlParams: memberUrlParams,
        queryParams: memberQueryParams,
    };

    try {
        await queryClient.fetchQuery(memberOptions(memberParams));
    } catch (error: unknown) {
        const parsedError = errorUtils.serialize(error);
        const errorNamespace = 'app.governance.daoMemberDetailsPage.error';
        const actionLink = `/dao/${network}/${addressOrEns}/members`;

        return (
            <Page.Error
                actionLink={actionLink}
                error={parsedError}
                errorNamespace={errorNamespace}
            />
        );
    }

    return (
        <Page.Container queryClient={queryClient}>
            <DaoMemberDetailsPageClient
                address={address}
                daoId={daoId}
                pluginAddress={bodyPlugin.address}
            />
        </Page.Container>
    );
};
