import { type IDao } from '@/shared/api/daoService';
import { Page } from '@/shared/components/page';

export interface ICapitalDistributorRewardsPageClientProps {
    /**
     * DAO to display the rewards page for.
     */
    dao: IDao;
}

export const CapitalDistributorRewardsPageClient: React.FC<ICapitalDistributorRewardsPageClientProps> = (props) => {
    const { dao } = props;

    return (
        <>
            <Page.Content>
                <Page.Main title="Rewards">
                    <p>Rewards List ({dao.name})</p>
                </Page.Main>
                <Page.Aside>
                    <Page.AsideCard title="All your rewards">
                        <p>Rewards Stats</p>
                    </Page.AsideCard>
                </Page.Aside>
            </Page.Content>
        </>
    );
};
