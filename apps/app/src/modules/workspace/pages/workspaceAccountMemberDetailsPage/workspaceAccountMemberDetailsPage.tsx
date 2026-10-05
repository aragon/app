// Imported from the page file (not the module barrel): the RSC pulls in server-only prefetch code that must stay
// out of the barrel's client graph.

// The `next/navigation` alias points to the client-hooks wrapper, which cannot re-export server functions.
import { notFound } from 'next/navigation-original';
import { DaoMemberDetailsPage } from '@/modules/governance/pages/daoMemberDetailsPage/daoMemberDetailsPage';
import { RedirectToUrl } from '@/shared/components/redirectToUrl';
import { featureFlags } from '@/shared/featureFlags';
import type { IWorkspaceAccountMemberPageParams } from '@/shared/types';
import { daoUtils } from '@/shared/utils/daoUtils';
import { workspaceQueryService } from '../../api/workspaceQueryService';
import { WorkspaceAccountGate } from '../../components/workspaceAccountGate';
import { workspaceUtils } from '../../utils/workspaceUtils';

export interface IWorkspaceAccountMemberDetailsPageProps {
    /**
     * URL parameters of the page.
     */
    params: Promise<IWorkspaceAccountMemberPageParams>;
}

/**
 * Details of one member of one account of a workspace.
 *
 * Like `WorkspaceAccountMembersPage`, only the DAO branch exists so far: the DAO member page is rendered as is and
 * only the shape of the route parameters is adapted. Its address-validation fallbacks (invalid address,
 * non-checksummed redirect) build `/dao/…` URLs, so the links to this page always carry the checksummed address.
 *
 * What the DAO page cannot know is read here: membership is plugin-scoped, and the DAO page has no way to tell
 * which body the member belongs to — it takes the first visible one, which on a multi-body DAO reports a body the
 * member may not be in (no voting power, no token balance, no error). The workspace members endpoint names the
 * governance of every membership, so it is asked before delegating.
 */
export const WorkspaceAccountMemberDetailsPage: React.FC<
    IWorkspaceAccountMemberDetailsPageProps
> = async (props) => {
    const { params } = props;

    if (!(await featureFlags.isEnabled('workspaces'))) {
        notFound();
    }

    const { workspaceId, accountId, address: memberAddress } = await params;
    const { network, address } = daoUtils.parseDaoId(accountId);

    // No registry read is needed to ask: an account ID is a network and an address, which is exactly what the
    // endpoint takes. Asking for this one account is what makes the answer usable — the response can then only
    // carry memberships of this account, so its governance is one this DAO page can read. One account and one
    // member address also narrow it to a single row, hence the page size of one.
    const memberList = await workspaceQueryService
        .getMemberList({
            body: {
                accounts: [{ network, address }],
                filters: { memberAddress },
                pagination: { pageSize: 1 },
            },
        })
        // A members-endpoint hiccup must not fail a page that renders without it: the DAO page then picks the first
        // body, which is what it did before this lookup existed.
        .catch(() => undefined);

    const member = memberList?.data[0];

    // The address is a member of nothing on this account, so there is no member page to serve. Nothing in the app
    // links here — the aggregated list only ever points at an account the member belongs to — so this is a stale,
    // shared or hand-edited URL, and the account's members page is the nearest thing it asked for. A failed lookup
    // is not an answer, so it falls through to the DAO page instead of redirecting.
    if (memberList != null && member == null) {
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

    // A member of two bodies of the same DAO has one membership per body. Which one the page reports is the
    // endpoint's order, the same arbitrary-but-stable choice the aggregated list makes for which account to link to.
    const bodyPluginAddress = member?.memberships[0]?.governance.address;

    return (
        <WorkspaceAccountGate accountId={accountId}>
            <DaoMemberDetailsPage
                bodyPluginAddress={bodyPluginAddress}
                params={Promise.resolve({
                    network,
                    addressOrEns: address,
                    address: memberAddress,
                })}
            />
        </WorkspaceAccountGate>
    );
};
