import type { GetTokenVotingMembershipRequestDTO } from '@aragon/aragon-domain';
// biome-ignore lint/style/noRestrictedImports: server-side BFF validation; strict EIP-55 validation is explicitly disabled.
import { isAddress } from 'viem';
import { domainNetworks } from '@/shared/api/aragonDomainService/aragonDomainService.constants';
import type {
    IDao,
    IDaoPlugin,
    IPluginSettings,
} from '@/shared/api/daoService';
import { PluginInterfaceType } from '@/shared/api/daoService';
import { networkDefinitions } from '@/shared/constants/networkDefinitions';
import type {
    IGetTokenVotingMembershipQueryParams,
    TokenVotingMembershipSource,
} from './tokenVotingMembershipService.api';

export interface ITokenVotingMembershipPluginSettings extends IPluginSettings {
    /**
     * Governance token of the plugin. `underlying` is only set when the
     * governance token wraps another token (wrapped ERC-20, VE adapter).
     */
    token: {
        address: string;
        underlying?: string | null;
    };
    /**
     * Voting-escrow settings, only set when voting power comes from escrow
     * locks instead of plain ERC-20 balances.
     */
    votingEscrow?: unknown;
}

export interface IResolveDomainRequestParams {
    /**
     * DAO owning the plugin, used for the chain of the domain query.
     */
    dao: IDao;
    /**
     * Plugin to fetch the members of.
     */
    plugin?: IDaoPlugin<ITokenVotingMembershipPluginSettings>;
}

/**
 * Maximum page size accepted by the BFF, mirroring the aragon-domain limit.
 */
export const maximumPageSize = 250;

const daoIdRegex = /^[a-z0-9-]+-0x[0-9a-fA-F]{40}$/;

const isPositiveInteger = (value: number): boolean =>
    Number.isInteger(value) && value > 0;

const membershipSources: TokenVotingMembershipSource[] = ['domain', 'backend'];

const isMembershipSource = (
    value: string,
): value is TokenVotingMembershipSource =>
    membershipSources.includes(value as TokenVotingMembershipSource);

/**
 * Validates the query params of the membership BFF route. Returns `undefined`
 * for anything the route should answer with a 400 instead of forwarding.
 */
export const parseMembershipQueryParams = (
    params: URLSearchParams,
): IGetTokenVotingMembershipQueryParams | undefined => {
    const daoId = params.get('daoId');
    const pluginAddress = params.get('pluginAddress');
    const page = params.get('page');
    const pageSize = params.get('pageSize');
    const source = params.get('source');

    const parsedPage = page != null ? Number(page) : undefined;
    const parsedPageSize = pageSize != null ? Number(pageSize) : undefined;

    if (
        daoId == null ||
        !daoIdRegex.test(daoId) ||
        pluginAddress == null ||
        !isAddress(pluginAddress, { strict: false }) ||
        (parsedPage != null && !isPositiveInteger(parsedPage)) ||
        (parsedPageSize != null &&
            (!isPositiveInteger(parsedPageSize) ||
                parsedPageSize > maximumPageSize)) ||
        (source != null && !isMembershipSource(source))
    ) {
        return;
    }

    return {
        daoId,
        pluginAddress,
        page: parsedPage,
        pageSize: parsedPageSize,
        source: source ?? undefined,
    };
};

/**
 * Decides whether a membership query can be served by the aragon-domain and
 * builds its request when it can.
 *
 * The domain only covers plain ERC-20 token-voting governance tokens on the
 * networks it indexes. Wrapped and voting-escrow tokens, every other plugin
 * type and every other network stay on the legacy backend, and so does
 * anything the plugin settings don't state clearly.
 */
export const resolveDomainMembershipRequest = ({
    dao,
    plugin,
}: IResolveDomainRequestParams):
    | Omit<GetTokenVotingMembershipRequestDTO, 'page' | 'pageSize'>
    | undefined => {
    if (
        plugin == null ||
        plugin.interfaceType !== PluginInterfaceType.TOKEN_VOTING ||
        !domainNetworks.includes(dao.network)
    ) {
        return;
    }

    const { token, votingEscrow } = plugin.settings;

    if (
        token?.address == null ||
        token.underlying != null ||
        votingEscrow != null
    ) {
        return;
    }

    return {
        chainId: networkDefinitions[dao.network].id,
        pluginAddress: plugin.address.toLowerCase(),
        tokenContractAddress: token.address.toLowerCase(),
    };
};
