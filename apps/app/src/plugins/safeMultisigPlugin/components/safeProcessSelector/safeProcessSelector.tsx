'use client';

import { useEffect } from 'react';
import type { ISelectPluginDialogProcessListItemProps } from '@/modules/governance/dialogs/selectPluginDialog';
import { ProcessDataListItem } from '@/shared/components/processDataListItem';
import { useSafeProcessPermissionCheckProposalCreation } from '../../hooks/useSafeProcessPermissionCheckProposalCreation';

export const SafeProcessSelector: React.FC<
    ISelectPluginDialogProcessListItemProps
> = (props) => {
    const { process, dao, uniqueId, onEligibilityResult, ...otherProps } =
        props;
    const { hasPermission, isLoading } =
        useSafeProcessPermissionCheckProposalCreation({
            daoId: dao?.id ?? '',
            plugin: process,
            useConnectedUserInfo: dao != null,
        });

    useEffect(() => {
        if (!isLoading) {
            onEligibilityResult(uniqueId, hasPermission);
        }
    }, [hasPermission, isLoading, onEligibilityResult, uniqueId]);

    return (
        <ProcessDataListItem
            {...otherProps}
            dao={dao}
            isDisabled={isLoading || !hasPermission}
            process={process}
            showNotEligibleHelpText={!isLoading && !hasPermission}
        />
    );
};
