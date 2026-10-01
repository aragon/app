'use client';

import { DefinitionList } from '@aragon/gov-ui-kit';
import { useAdminGovernanceSettings } from '../../hooks/useAdminGovernanceSettings';

export interface IAdminGovernanceInfoProps {}

export const AdminGovernanceInfo: React.FC<IAdminGovernanceInfoProps> = () => {
    const settings = useAdminGovernanceSettings();

    return (
        <DefinitionList.Container>
            {settings.map((governanceSetting, index) => (
                // biome-ignore lint/suspicious/noArrayIndexKey: static settings list, never reordered
                <DefinitionList.Item key={index} term={governanceSetting.term}>
                    <p className="text-neutral-500">
                        {governanceSetting.definition}
                    </p>
                </DefinitionList.Item>
            ))}
        </DefinitionList.Container>
    );
};
