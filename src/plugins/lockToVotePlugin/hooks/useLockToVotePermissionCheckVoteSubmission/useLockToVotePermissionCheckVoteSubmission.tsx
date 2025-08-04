import type { IPermissionCheckGuardParams, IPermissionCheckGuardResult } from '@/modules/governance/types';
import { useTranslations } from '@/shared/components/translationsProvider';
import { networkDefinitions } from '@/shared/constants/networkDefinitions';
import { ChainEntityType, DateFormat, formatterUtils, useBlockExplorer } from '@aragon/gov-ui-kit';
import type { ILockToVotePlugin } from '../../types';
import { useLockToVoteData } from '../useLockToVoteData';

export interface IUseLockToVotePermissionCheckVoteSubmissionParams extends IPermissionCheckGuardParams {
    /**
     * Lock to vote plugin to be processed.
     */
    plugin: ILockToVotePlugin;
}

export const useLockToVotePermissionCheckVoteSubmission = (
    params: IUseLockToVotePermissionCheckVoteSubmissionParams,
): IPermissionCheckGuardResult => {
    const { plugin, proposal, daoId } = params;

    const { t } = useTranslations();

    const { token } = plugin.settings;
    const { blockTimestamp, network, transactionHash } = proposal!;
    const { id: chainId } = networkDefinitions[network];

    const { balance, lockedAmount, isLoading } = useLockToVoteData({ plugin, daoId });

    const creationDate = blockTimestamp * 1000;
    const formattedCreationDate = formatterUtils.formatDate(creationDate, { format: DateFormat.YEAR_MONTH_DAY });

    const { buildEntityUrl } = useBlockExplorer({ chainId });
    const proposalCreationUrl = buildEntityUrl({ type: ChainEntityType.TRANSACTION, id: transactionHash });

    const settings = [
        {
            term: t('app.plugins.lockToVote.lockToVotePermissionCheckVoteSubmission.createdAt'),
            definition: formattedCreationDate!,
            link: { href: proposalCreationUrl, textClassName: 'first-letter:capitalize' },
        },
        {
            term: t('app.plugins.lockToVote.lockToVotePermissionCheckVoteSubmission.votingPower'),
            definition: `0 ${token.symbol}`,
        },
    ];

    // Return positive result for users having token balance greater than 0 to display lock dialog instead of the
    // default permission dialog
    const hasPermission = (balance ?? 0) > 0 || lockedAmount > 0;

    return { hasPermission, settings: [settings], isLoading, isRestricted: true };
};
