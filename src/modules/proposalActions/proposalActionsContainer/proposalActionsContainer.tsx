'use client';

import { type IContainerProps } from '@/shared/components/container';
import { Card, Heading, Tabs } from '@aragon/ods';

export interface IProposalActionContainerProps extends IContainerProps {}

export const proposalActionsContainer: React.FC<IProposalActionContainerProps> = (props) => {
    const { children } = props;
    return (
        <Card>
            {/* TODO: Add translator mapping for Actions */}
            <Heading>Actions</Heading>
            <Tabs.Root defaultValue="action-container-basic">
                <Tabs.List>
                    <Tabs.Trigger label="Basic" value="action-container-basic" />
                    <Tabs.Trigger label="Composer" value="action-container-composer" />
                    <Tabs.Trigger label="Code" value="action-container-code" />
                </Tabs.List>
                <Tabs.Content value="action-container-basic">
                    <div className="flex h-24 items-center justify-center border border-dashed border-info-300 bg-info-100">
                        I WILL BE THE TAB WHICH WILL CONTAIN THE COLUMN OF BASIC ACTIONS
                    </div>
                </Tabs.Content>
                <Tabs.Content value="action-container-composer">
                    <div className="flex h-24 items-center justify-center border border-dashed border-info-300 bg-info-100">
                        I WILL BE THE TAB WHICH WILL CONTAIN THE COLUMN OF COMPOSER ACTIONS
                    </div>
                </Tabs.Content>
                <Tabs.Content value="action-container-code">
                    <div className="flex h-24 items-center justify-center border border-dashed border-info-300 bg-info-100">
                        I WILL BE THE TAB WHICH WILL CONTAIN THE COLUMN OF CODE ACTIONS
                    </div>
                </Tabs.Content>
            </Tabs.Root>
        </Card>
    );
};
