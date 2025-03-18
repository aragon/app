import { IDao } from '@/shared/api/daoService';
import { Page } from '@/shared/components/page';
import { ipfsUtils } from '@/shared/utils/ipfsUtils';
import { DaoAvatar } from '@aragon/gov-ui-kit';

export interface IHeaderTestProps {
    dao: IDao;
}

export const HeaderTest: React.FC<IHeaderTestProps> = (props) => {
    const { dao } = props;
    return (
        <Page.Header
            title={dao.name}
            description={dao.description}
            avatar={<DaoAvatar src={ipfsUtils.cidToSrc(dao.avatar)} name={dao.name} size="2xl" />}
        >
            <div>custom content</div>
        </Page.Header>
    );
};
