'use client';

import { useTranslations } from '@/shared/components/translationsProvider';
import { MpcPolicyForm } from '../mpcPolicyForm';

export interface IMpcCreateSystemFormPolicyProps {}

export const MpcCreateSystemFormPolicy: React.FC<
    IMpcCreateSystemFormPolicyProps
> = () => {
    const { t } = useTranslations();

    return (
        <div className="flex flex-col gap-6">
            <p className="text-neutral-500 text-sm">
                {t('app.mpc.mpcCreateSystemForm.policy.hint')}
            </p>
            <MpcPolicyForm fieldPrefix="policy" />
        </div>
    );
};
