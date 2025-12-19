'use client';

import { Button, Toggle, ToggleGroup } from '@aragon/gov-ui-kit';
import { useEffect } from 'react';
import { useAccount } from 'wagmi';
import { CreateDaoDialogId } from '@/modules/createDao/constants/createDaoDialogId';
import { useDialogContext } from '@/shared/components/dialogProvider';
import { useTranslations } from '@/shared/components/translationsProvider';
import { useFilterUrlParam } from '@/shared/hooks/useFilterUrlParam';
import { networkUtils } from '@/shared/utils/networkUtils';
import type { IGetDaoListParams } from '../../api/daoExplorerService';
import { DaoList } from '../daoList';

export interface IExploreDaosProps {
    /**
     * Initial parameters to use to fetch the list of DAOs.
     */
    initialParams: IGetDaoListParams;
}

export const exploreDaoFilterParam = 'daoFilter';

export const ExploreDaos: React.FC<IExploreDaosProps> = (props) => {
    const { initialParams } = props;

    const { t } = useTranslations();
    const { address } = useAccount();
    const { open } = useDialogContext();

    const [daoFilter, setDaoFilter] = useFilterUrlParam({
        name: exploreDaoFilterParam,
        fallbackValue: 'all',
        validValues: ['all', 'member'],
        enableUrlUpdate: true,
    });

    // Only update filter when value is defined and not empty string to ensure that one of the filters is always selected
    // Note: value comes back as empty string when toggle is deselected
    const handleToggleChange = (value?: string) => {
        if (value) {
            setDaoFilter(value);
        }
    };

    // Reset the filter to "all" when the user disconnects while on the "member" tab
    useEffect(() => {
        if (address == null && daoFilter === 'member') {
            setDaoFilter('all');
        }
    }, [address, daoFilter, setDaoFilter]);

    const memberQueryParams = {
        sort: 'blockTimestamp',
        networks: networkUtils.getSupportedNetworks(),
    };
    const memberParams =
        daoFilter === 'member' && address != null
            ? { urlParams: { address }, queryParams: memberQueryParams }
            : undefined;

    return (
        <div className="flex grow flex-col gap-3">
            <div className="flex items-center justify-between">
                <ToggleGroup
                    className="flex w-full items-center gap-x-2 md:gap-x-3"
                    isMultiSelect={false}
                    onChange={handleToggleChange}
                    value={daoFilter}
                >
                    <Toggle
                        label={t('app.explore.exploreDao.filter.all')}
                        value="all"
                    />
                    <Toggle
                        disabled={address == null}
                        label={t('app.explore.exploreDao.filter.member')}
                        value="member"
                    />
                </ToggleGroup>
                <Button
                    className="shrink-0"
                    onClick={() => open(CreateDaoDialogId.CREATE_DAO_DETAILS)}
                    size="md"
                    variant="primary"
                >
                    {t('app.explore.exploreDao.createDao')}
                </Button>
            </div>
            <DaoList
                initialParams={initialParams}
                memberParams={memberParams}
                showSearch={true}
            />
        </div>
    );
};
