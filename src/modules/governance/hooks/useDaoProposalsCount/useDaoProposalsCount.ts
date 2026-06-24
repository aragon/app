import { formatterUtils, NumberFormat } from '@aragon/gov-ui-kit';
import { useProposalListData } from '../useProposalListData';

export interface IUseDaoProposalsCountParams {
    /**
     * ID of the DAO to count the proposals for.
     */
    daoId: string;
}

/**
 * Returns the formatted count of a DAO's proposals, matching the total shown on
 * the proposals page aside: sub-proposals are excluded and only currently
 * installed plugins are counted. Returns "-" while the count is unavailable.
 */
export const useDaoProposalsCount = (
    params: IUseDaoProposalsCountParams,
): string => {
    const { daoId } = params;

    const { itemsCount } = useProposalListData({
        queryParams: {
            daoId,
            pageSize: 1,
            sort: 'blockTimestamp',
            isSubProposal: false,
            onlyActive: true,
            includeLinkedAccounts: false,
        },
    });

    if (itemsCount == null) {
        return '-';
    }

    return (
        formatterUtils.formatNumber(itemsCount, {
            format: NumberFormat.GENERIC_SHORT,
        }) ?? '-'
    );
};
