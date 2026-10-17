// The `next/navigation` alias points to the client-hooks wrapper, which cannot re-export server functions.
import { notFound } from 'next/navigation-original';
import { voteListFilterParam } from '@/modules/governance/components/voteList';
import { DaoMemberDetailsPage } from '@/modules/governance/pages/daoMemberDetailsPage/daoMemberDetailsPage';
import { RedirectToUrl } from '@/shared/components/redirectToUrl';
import { featureFlags } from '@/shared/featureFlags';
import type {
    IPageSearchParams,
    IWorkspaceAccountMemberPageParams,
} from '@/shared/types';
import { daoUtils } from '@/shared/utils/daoUtils';
import {
    type IWorkspaceAccountRef,
    workspaceQueryService,
} from '../../api/workspaceQueryService';
import { WorkspaceAccountGate } from '../../components/workspaceAccountGate';
import { workspaceUtils } from '../../utils/workspaceUtils';

interface IGetAccountMemberParams extends IWorkspaceAccountRef {
    /**
     * Address of the member to read the membership of.
     */
    memberAddress: string;
}

/**
 * The membership of one address on one account, or undefined when the endpoint could not answer.
 *
 * No registry read is needed to ask: an account ID is a network and an address, which is exactly what the endpoint
 * takes. Asking for this one account is what makes the answer usable — the response can then only carry memberships
 * of this account, so its governance is one this DAO page can read. One account and one member address also narrow
 * it to a single row, hence the page size of one.
 * @param params - Account to read on and address to read the membership of.
 * @returns The response of the members endpoint, or undefined when it failed.
 */
const getAccountMember = async (params: IGetAccountMemberParams) => {
    const { network, address, memberAddress } = params;

    try {
        return await workspaceQueryService.getMemberList({
            body: {
                accounts: [{ network, address }],
                filters: { memberAddress },
                pagination: { pageSize: 1 },
            },
        });
    } catch {
        // A members-endpoint hiccup must not fail a page that renders without it.
        return undefined;
    }
};

export interface IWorkspaceAccountMemberDetailsPageProps {
    /**
     * URL parameters of the page.
     */
    params: Promise<IWorkspaceAccountMemberPageParams>;
    /**
     * Search parameters of the page. Only `voteListFilterParam` is read: the body the reader was linked through.
     */
    searchParams?: Promise<IPageSearchParams>;
}

/**
 * Details of one member of one account of a workspace.
 *
 * Like `WorkspaceAccountMembersPage`, only the DAO branch exists so far: the DAO member page is rendered as is and
 * only the shape of the route parameters is adapted. Its address-validation fallbacks (invalid address,
 * non-checksummed redirect) build `/dao/…` URLs, so the links to this page always carry the checksummed address.
 */
export const WorkspaceAccountMemberDetailsPage: React.FC<
    IWorkspaceAccountMemberDetailsPageProps
> = async (props) => {
    const { params, searchParams } = props;

    if (!(await featureFlags.isEnabled('workspaces'))) {
        notFound();
    }

    const { workspaceId, accountId, address: memberAddress } = await params;
    const { network, address } = daoUtils.parseDaoId(accountId);

    const memberSearchParams = (await searchParams) ?? {};
    const bodyParam = memberSearchParams[voteListFilterParam];
    const linkedBodyId = typeof bodyParam === 'string' ? bodyParam : undefined;

    // Only asked when the URL leaves the body open; the redirect below goes with it.
    const memberList =
        linkedBodyId == null
            ? await getAccountMember({ network, address, memberAddress })
            : undefined;

    const member = memberList?.data[0];

    const isCompleteLookup = memberList != null && !memberList.partial;
    if (isCompleteLookup && member == null) {
        return (
            <RedirectToUrl
                url={workspaceUtils.getAccountScopeUrl(
                    workspaceId,
                    accountId,
                    'members',
                )}
            />
        );
    }

    const bodyPluginId =
        linkedBodyId ?? member?.memberships[0]?.governance.address;

    return (
        <WorkspaceAccountGate accountId={accountId}>
            <DaoMemberDetailsPage
                bodyPluginId={bodyPluginId}
                params={Promise.resolve({
                    network,
                    addressOrEns: address,
                    address: memberAddress,
                })}
            />
        </WorkspaceAccountGate>
    );
};
