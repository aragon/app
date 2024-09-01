import { useMember } from '@/modules/governance/api/governanceService';
import { useDaoSettings } from '@/shared/api/daoService';
import { useAccount } from 'wagmi';
import { type IDaoMultisigSettings } from '../../types';

export const useCanCreateProposal = (daoId: string) => {
    const { address } = useAccount();

    const settingsUrlParams = { daoId };
    const { data: settings, isLoading: isFetchingSettings } = useDaoSettings<IDaoMultisigSettings>({
        urlParams: settingsUrlParams,
    });

    const memberUrlParams = { address: address as string };
    const memberQueryParams = { daoId };
    const { data: member, isLoading: isFetchingMember } = useMember(
        { urlParams: memberUrlParams, queryParams: memberQueryParams },
        { enabled: address != null },
    );

    const canCreateProposal = settings?.settings.onlyListed === false || member != null;

    return {
        canCreateProposal: canCreateProposal,
        isLoading: isFetchingMember || isFetchingSettings,
        settings: [
            { term: 'Proposal creation', definition: 'Multisig member' },
            { term: 'Your status', definition: 'Not a member' },
        ],
    };
};
