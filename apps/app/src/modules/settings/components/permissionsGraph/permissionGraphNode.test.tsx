import { render, screen } from '@testing-library/react';
import { ReactFlowProvider } from '@xyflow/react';
import type { ComponentProps } from 'react';
import {
    PermissionGraphNode,
    PermissionStackNode,
} from './permissionGraphNode';

jest.mock('@/shared/components/translationsProvider', () => ({
    useTranslations: () => ({
        t: (key: string, params?: Record<string, string>) =>
            params?.condition ?? key,
    }),
}));

const renderStackNode = () => {
    const props = {
        data: {
            permissions: [
                {
                    edgeId: 'edge-id',
                    permissionName: 'EXECUTE_PERMISSION',
                    permissionDisplayName: 'Execute',
                },
            ],
        },
    } as unknown as ComponentProps<typeof PermissionStackNode>;

    return render(
        <ReactFlowProvider>
            <PermissionStackNode {...props} />
        </ReactFlowProvider>,
    );
};

const renderGraphNode = (
    data: Partial<ComponentProps<typeof PermissionGraphNode>['data']> = {},
) => {
    const props = {
        data: {
            id: 'plugin-node',
            kind: 'plugin',
            label: 'Token Voting',
            tag: 'TOKENVOTING',
            address: '0x8888888888888888888888888888888888888888',
            ...data,
        },
    } as unknown as ComponentProps<typeof PermissionGraphNode>;

    return render(
        <ReactFlowProvider>
            <PermissionGraphNode {...props} />
        </ReactFlowProvider>,
    );
};

describe('<PermissionGraphNode /> component', () => {
    it('marks uninstalled plugin nodes as historical', () => {
        renderGraphNode({
            layer: 'historicalPlugin',
            status: 'uninstalled',
        });

        expect(
            screen.getByText(
                'app.settings.daoPermissionsPage.graphView.node.uninstalledPlugin',
            ),
        ).toBeInTheDocument();
    });

    it('marks historical plugin nodes separately from installed plugins', () => {
        renderGraphNode({
            layer: 'historicalPlugin',
            status: 'historical',
        });

        expect(
            screen.getByText(
                'app.settings.daoPermissionsPage.graphView.node.historicalPlugin',
            ),
        ).toBeInTheDocument();
    });
});

describe('<PermissionStackNode /> component', () => {
    it('keeps compact stack nodes while preserving the full permission ID as title', () => {
        const { container } = renderStackNode();
        const button = container.querySelector('button')!;
        const visibleLabels = [
            ...button.querySelectorAll('span:not(.sr-only)'),
        ].map((element) => element.textContent);

        expect(visibleLabels).toEqual(['Execute']);
        expect(button).toHaveAttribute('title', 'EXECUTE_PERMISSION');
    });
});
