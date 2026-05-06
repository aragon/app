'use client';

import {
    addressUtils,
    Button,
    Card,
    CardEmptyState,
    Collapsible,
    Heading,
} from '@aragon/gov-ui-kit';
import { useConnection } from 'wagmi';
import { useDelegateStatementCid, useEnsName } from '@/modules/ens';
import type { ITokenPluginSettings } from '@/plugins/tokenPlugin/types';
import { type IDaoPlugin, useDao } from '@/shared/api/daoService';
import { useDelegateStatement } from '@/shared/api/delegateStatementService';
import { useDialogContext } from '@/shared/components/dialogProvider';
import { SafeDocumentParser } from '@/shared/components/SafeDocumentParser';
import { useTranslations } from '@/shared/components/translationsProvider';
import { GovernanceDialogId } from '../../constants/governanceDialogId';
import type { IDelegateStatementDialogParams } from '../../dialogs/delegateStatementDialog';

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

    const { data: cid } = useDelegateStatementCid({
        ensName,
        network: dao?.network,
        tokenAddress,
    });

    const { data: statement } = useDelegateStatement({ cid });

    if (ensName == null || dao == null) {
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
            network: dao.network,
            existingCid: cid ?? null,
        };
        open(GovernanceDialogId.DELEGATE_STATEMENT_FORM, { params });
    };

    if (statement != null) {
        return (
            <Card className="flex flex-col gap-2 p-4 md:gap-3 md:p-6">
                <Heading size="h3">
                    {t('app.governance.delegationStatementCard.heading')}
                </Heading>
                <Collapsible
                    buttonLabelClosed={t(
                        'app.governance.delegationStatementCard.readMore',
                    )}
                    buttonLabelOpened={t(
                        'app.governance.delegationStatementCard.readLess',
                    )}
                >
                    <SafeDocumentParser
                        document={statement.content}
                        immediatelyRender={false}
                    />
                </Collapsible>
                {isOwner && (
                    <div className="pt-3 md:pt-6">
                        <Button
                            className="w-full md:w-auto"
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
