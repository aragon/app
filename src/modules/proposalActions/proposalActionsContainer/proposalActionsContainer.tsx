'use client';

import { type IContainerProps } from '@/shared/components/container';
import { Card, Heading, Tabs } from '@aragon/ods';
import { ProposalActionsProvider, useProposalActionsContext } from '../proposalActionsContext/proposalActionsContext';

export interface IProposalActionContainerProps extends IContainerProps {}

const ProposalActionsContainer: React.FC<IProposalActionContainerProps> = (props) => {
    const { children } = props;
    const { activeTab, setActiveTab } = useProposalActionsContext();

    return (
        <Card>
            <Heading>Actions</Heading>
            <Tabs.Root defaultValue={activeTab} onValueChange={(value) => setActiveTab(value)}>
                <Tabs.List>
                    <Tabs.Trigger label="Basic" value="basic" />
                    <Tabs.Trigger label="Composer" value="composer" />
                    <Tabs.Trigger label="Code" value="code" />
                </Tabs.List>
                <Tabs.Content value="basic">
                    <div className="flex h-24 items-center justify-center border border-dashed border-info-300 bg-info-100">
                        I WILL BE THE TAB WHICH WILL CONTAIN THE COLUMN OF BASIC ACTIONS
                    </div>
                </Tabs.Content>
                <Tabs.Content value="composer">
                    <div className="flex h-24 items-center justify-center border border-dashed border-info-300 bg-info-100">
                        I WILL BE THE TAB WHICH WILL CONTAIN THE COLUMN OF COMPOSER ACTIONS
                    </div>
                </Tabs.Content>
                <Tabs.Content value="code">
                    <div className="flex h-24 items-center justify-center border border-dashed border-info-300 bg-info-100">
                        I WILL BE THE TAB WHICH WILL CONTAIN THE COLUMN OF CODE ACTIONS
                    </div>
                </Tabs.Content>
            </Tabs.Root>
            {children}
        </Card>
    );
};

export const ProposalActions: React.FC<IProposalActionContainerProps> = (props) => (
    <ProposalActionsProvider>
        <ProposalActionsContainer {...props} />
    </ProposalActionsProvider>
);
