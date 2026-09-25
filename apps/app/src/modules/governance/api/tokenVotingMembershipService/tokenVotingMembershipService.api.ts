import type { PageDTO, TokenVotingMemberDTO } from '@aragon/aragon-domain';
import type { IRequestQueryParams } from '@/shared/api/httpService';

/**
 * Source that served a membership page. Decided by the BFF, never by the UI.
 */
export type TokenVotingMembershipSource = 'domain' | 'backend';

export interface IGetTokenVotingMembershipQueryParams {
    /**
     * ID of the DAO owning the plugin.
     */
    daoId: string;
    /**
     * Address of the plugin to fetch the members of.
     */
    pluginAddress: string;
    /**
     * Page to fetch, defaults to the first page.
     */
    page?: number;
    /**
     * Number of members per page.
     */
    pageSize?: number;
    /**
     * Continuation hint echoed back from the previous page so that one list is
     * never stitched together from two sources. Opaque to the UI: it is read
     * off the previous response and sent back unchanged.
     */
    source?: TokenVotingMembershipSource;
}

export interface IGetTokenVotingMembershipParams
    extends IRequestQueryParams<IGetTokenVotingMembershipQueryParams> {}

export interface ITokenVotingMembershipPage
    extends PageDTO<TokenVotingMemberDTO> {
    /**
     * Source that served this page, see `source` on the query params.
     */
    source: TokenVotingMembershipSource;
}
