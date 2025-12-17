'use client';

import { DefinitionList } from '@aragon/gov-ui-kit';
import { useAdminGovernanceSettings } from '../../hooks/useAdminGovernanceSettings';

export type IAdminGovernanceInfoProps = Record<string, never>;

export const AdminGovernanceInfo: React.FC<IAdminGovernanceInfoProps> = () => {
    const settings = useAdminGovernanceSettings();

    return (
        <DefinitionList.Container>
            {settings.map((governanceSetting) => (
                <DefinitionList.Item key={governanceSetting.term} term={governanceSetting.term}>
                    <p className="text-neutral-500">{governanceSetting.definition}</p>
                </DefinitionList.Item>
            ))}
        </DefinitionList.Container>
    );
};
