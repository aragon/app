import type { ICampaign } from '@/plugins/capitalDistributorPlugin/api/capitalDistributorService';
import { WizardDialog } from '@/shared/components/wizards/wizardDialog';
import { Card, Heading, Link } from '@aragon/gov-ui-kit';
import { CapitalDistributorClaimDialogDetailsInfo } from './capitalDistributorClaimDialogDetailsInfo';

export interface ICapitalDistributorClaimDialogDetailsProps {
    /**
     * Campaign to display the details for.
     */
    campaign: ICampaign;
}

export const CapitalDistributorClaimDialogDetails: React.FC<ICapitalDistributorClaimDialogDetailsProps> = (props) => {
    const { campaign } = props;
    const { resources } = campaign;

    return (
        <WizardDialog.Step id="overview" order={1} meta={{ name: '' }} className="flex flex-col gap-4">
            <Card className="flex grow flex-col gap-3 border border-neutral-100 p-6">
                <div className="flex flex-row">
                    <CapitalDistributorClaimDialogDetailsInfo info={{ label: 'Total amount', value: '42.32K ENA' }} />
                    <CapitalDistributorClaimDialogDetailsInfo info={{ label: 'Value', value: '$12.18K' }} />
                </div>
                <div className="h-[1px] w-full bg-neutral-100" />
                <div className="flex flex-row">
                    <CapitalDistributorClaimDialogDetailsInfo info={{ label: 'Type', value: 'Airdrop' }} />
                    <CapitalDistributorClaimDialogDetailsInfo info={{ label: 'Status', value: 'Claimable' }} />
                </div>
                <div className="h-[1px] w-full bg-neutral-100" />
                <div className="flex flex-row">
                    <CapitalDistributorClaimDialogDetailsInfo info={{ label: 'Claimable', value: '207 days left' }} />
                    <CapitalDistributorClaimDialogDetailsInfo info={{ label: 'Deadline', value: '30.12.2025' }} />
                </div>
            </Card>
            {resources != null && resources.length > 0 && (
                <Card className="flex flex-col gap-3 border border-neutral-100 p-6">
                    <Heading size="h4">Resources</Heading>
                    <div className="flex flex-col gap-4">
                        {resources.map((resource) => (
                            <Link key={resource.url} href={resource.url} isExternal={true} showUrl={true}>
                                {resource.name}
                            </Link>
                        ))}
                    </div>
                </Card>
            )}
        </WizardDialog.Step>
    );
};
