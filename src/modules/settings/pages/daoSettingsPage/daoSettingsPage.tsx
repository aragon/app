import { Page } from '@/shared/components/page';
import type { IDaoPageParams } from '@/shared/types';
import { getEnsAddress } from 'wagmi/actions';
import { wagmiConfig } from '../../../application/constants/wagmi';
import { DaoSettingsPageClient } from './daoSettingsPageClient';

export interface IDaoSettingsPageProps {
    /**
     * DAO page parameters.
     */
    params: Promise<IDaoPageParams>;
}

export const DaoSettingsPage: React.FC<IDaoSettingsPageProps> = async (props) => {
    const { params } = props;
    const { id, network } = await params;

    let daoId: string;

    if (id.endsWith('.eth')) {
        const ensAddress = await getEnsAddress(wagmiConfig, {
            name: id,
            chainId: 1,
        });

        if (!ensAddress) {
            throw new Error('ENS address not found');
        }

        daoId = `${network}-${ensAddress}`;
    } else {
        daoId = `${network}-${id}`;
    }

    return (
        <Page.Container>
            <Page.Content>
                <DaoSettingsPageClient daoId={daoId} />
            </Page.Content>
        </Page.Container>
    );
};
