'use client';

import { CreateDaoDialog } from '@/modules/createDao/constants/moduleDialogs';
import { useDialogContext } from '@/shared/components/dialogProvider';
import { useTranslations } from '@/shared/components/translationsProvider';
import { Button, Toggle, ToggleGroup } from '@aragon/gov-ui-kit';
import { useState } from 'react';
import { useAccount } from 'wagmi';
import type { IGetDaoListParams } from '../../api/daoExplorerService';
import { DaoList } from '../../components/daoList';

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

    const [daoFilter, setDaoFilter] = useState<string | undefined>('all');

    const daoListParams = daoFilter === 'all' ? initialParams : undefined;
    const daoListMemberParams =
        daoFilter === 'member' ? { urlParams: { address: address! }, queryParams: { sort: 'blockNumber' } } : undefined;

    return (
        <div>
            <div className="flex grow flex-col gap-3">
                <div className="flex items-center justify-between">
                    <div className="flex w-full items-center gap-x-2 md:gap-x-3">
                        <ToggleGroup isMultiSelect={false} onChange={setDaoFilter} value={daoFilter}>
                            <Toggle value="all" label={t('app.explore.exploreDaosPage.filter.all')} />
                            <Toggle
                                value="member"
                                label={t('app.explore.exploreDaosPage.filter.member')}
                                disabled={address == null}
                            />
                        </ToggleGroup>
                    </div>
                    <Button
                        variant="primary"
                        size="md"
                        onClick={() => open(CreateDaoDialog.CREATE_DAO_DETAILS)}
                        className="shrink-0"
                    >
                        {t('app.explore.exploreDaosPage.createDao')}
                    </Button>
                </div>
                <DaoList initialParams={daoListParams} daoListByMemberParams={daoListMemberParams} />
            </div>
        </div>
    );
};
