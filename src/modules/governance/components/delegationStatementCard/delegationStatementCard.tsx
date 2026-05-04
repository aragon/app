'use client';

import { addressUtils, Button, Card, CardEmptyState } from '@aragon/gov-ui-kit';
import { useConnection } from 'wagmi';
import { useDelegateStatementCid, useEnsName } from '@/modules/ens';
import type { ITokenPluginSettings } from '@/plugins/tokenPlugin/types';
import { type IDaoPlugin, Network, useDao } from '@/shared/api/daoService';
import { useIpfsJson } from '@/shared/api/ipfsService';
import { useDialogContext } from '@/shared/components/dialogProvider';
import { SafeDocumentParser } from '@/shared/components/SafeDocumentParser';
import { useTranslations } from '@/shared/components/translationsProvider';
import { GovernanceDialogId } from '../../constants/governanceDialogId';
import type { IDelegateStatementDialogParams } from '../../dialogs/delegateStatementDialog';
import {
    type IDelegateStatement,
    isDelegateStatement,
} from './delegateStatement.api';

// Reference: ENS resolves on Ethereum mainnet; fall back to it while the DAO loads.
const FALLBACK_NETWORK = Network.ETHEREUM_MAINNET;

export interface IDelegationStatementCardProps {
    /**
     * DAO plugin whose delegation token this statement belongs to.
     */
    plugin: IDaoPlugin;
    /**
     * Address of the member whose profile is being viewed.
     */
    memberAddress: string;
    /**
     * ID of the DAO.
     */
    daoId: string;
}

export const DelegationStatementCard: React.FC<
    IDelegationStatementCardProps
> = (props) => {
    const { plugin, memberAddress, daoId } = props;

    const { t } = useTranslations();
    const { open } = useDialogContext();
    const { address: connectedAddress } = useConnection();
    const { data: dao } = useDao({ urlParams: { id: daoId } });
    const { data: ensName } = useEnsName(memberAddress);

    const tokenAddress = (plugin.settings as ITokenPluginSettings).token
        .address;

    const { data: cidMap } = useDelegateStatementCid({
        ensName,
        network: dao?.network ?? FALLBACK_NETWORK,
        tokenAddresses: [tokenAddress],
    });

    const cid = cidMap?.[tokenAddress.toLowerCase()] ?? null;

    const { data: statement } = useIpfsJson<IDelegateStatement>({
        cid,
        validate: isDelegateStatement,
    });

    if (ensName == null) {
        return null;
    }

    const isOwner = addressUtils.isAddressEqual(
        connectedAddress,
        memberAddress,
    );

    const handleEditClick = () => {
        const params: IDelegateStatementDialogParams = {
            tokenAddress,
            memberAddress,
            daoId,
            ensName,
            network: dao?.network ?? FALLBACK_NETWORK,
            existingCid: cid,
        };
        open(GovernanceDialogId.DELEGATE_STATEMENT_FORM, { params });
    };

    if (statement != null) {
        return (
            <Card className="flex flex-col gap-4 p-4 md:p-6">
                <SafeDocumentParser document={statement.content} />
                {isOwner && (
                    <div>
                        <Button
                            onClick={handleEditClick}
                            size="md"
                            variant="secondary"
                        >
                            {t(
                                'app.governance.delegationStatementCard.editAction',
                            )}
                        </Button>
                    </div>
                )}
            </Card>
        );
    }

    if (!isOwner) {
        return null;
    }

    return (
        <CardEmptyState
            description={t(
                'app.governance.delegationStatementCard.emptyState.description',
            )}
            heading={t(
                'app.governance.delegationStatementCard.emptyState.heading',
            )}
            isStacked={false}
            objectIllustration={{ object: 'USERS' }}
            primaryButton={{
                label: t(
                    'app.governance.delegationStatementCard.emptyState.action',
                ),
                onClick: handleEditClick,
            }}
        />
    );
};
