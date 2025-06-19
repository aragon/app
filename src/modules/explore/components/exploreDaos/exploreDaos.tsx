'use client';

import { CreateDaoDialogId } from '@/modules/createDao/constants/createDaoDialogId';
import { useDialogContext } from '@/shared/components/dialogProvider';
import { useTranslations } from '@/shared/components/translationsProvider';
import { Button, Toggle, ToggleGroup } from '@aragon/gov-ui-kit';
import { useEffect, useState } from 'react';
import { useAccount } from 'wagmi';
import type { IGetDaoListParams } from '../../api/daoExplorerService';
import { DaoList } from '../daoList';

export interface IExploreDaosProps {
    /**
     * Initial parameters to use to fetch the list of DAOs.
     */
    initialParams: IGetDaoListParams;
}

export const ExploreDaos: React.FC<IExploreDaosProps> = (props) => {
    const { initialParams } = props;

    const { t } = useTranslations();
    const { address } = useAccount();
    const { open } = useDialogContext();

    const [daoFilter, setDaoFilter] = useState('all');

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
    }, [address, daoFilter]);

    const memberParams =
        daoFilter === 'member' && address != null
            ? { urlParams: { address }, queryParams: { sort: 'blockTimestamp' } }
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
                    <Toggle value="all" label={t('app.explore.exploreDao.filter.all')} />
                    <Toggle
                        value="member"
                        label={t('app.explore.exploreDao.filter.member')}
                        disabled={address == null}
                    />
                </ToggleGroup>
                <Button
                    variant="primary"
                    size="md"
                    onClick={() => open(CreateDaoDialogId.CREATE_DAO_DETAILS)}
                    className="shrink-0"
                >
                    {t('app.explore.exploreDao.createDao')}
                </Button>
            </div>
            <DaoList initialParams={initialParams} memberParams={memberParams} showSearch={true} />
        </div>
    );
};
