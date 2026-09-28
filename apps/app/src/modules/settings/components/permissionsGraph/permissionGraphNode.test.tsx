import { render, screen } from '@testing-library/react';
import { ReactFlowProvider } from '@xyflow/react';
import type { ComponentProps } from 'react';
import { ANY_ADDR } from '../../constants/permissionSentinels';
import { PermissionGraphNode } from './permissionGraphNode';
import { PermissionStackNode } from './permissionStackNode';

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
    it.each([
        {
            name: 'uninstalled plugin nodes as historical',
            status: 'uninstalled',
            typeKey:
                'app.settings.daoPermissionsPage.graphView.node.uninstalledPlugin',
        },
        {
            name: 'historical plugin nodes separately from installed plugins',
            status: 'historical',
            typeKey:
                'app.settings.daoPermissionsPage.graphView.node.historicalPlugin',
        },
    ] as const)('marks $name', ({ status, typeKey }) => {
        renderGraphNode({ layer: 'historicalPlugin', status });

        expect(screen.getByText(typeKey)).toBeInTheDocument();
    });

    it('renders internal process bodies as plugin cards with their type tag', () => {
        renderGraphNode({
            layer: 'processInternal',
            label: 'Token Voting',
            tag: 'TOKENVOTING',
        });

        expect(screen.getByText('Token Voting')).toBeInTheDocument();
        expect(screen.getByText('TOKENVOTING')).toBeInTheDocument();
        expect(
            screen.getByText(
                'app.settings.daoPermissionsPage.graphView.node.plugin',
            ),
        ).toBeInTheDocument();
    });

    it.each([
        {
            name: 'process bodies with the Safe avatar instead of a redundant tag',
            data: { layer: 'processInternal', tag: 'SAFE' },
        },
        {
            name: 'actor nodes with the Safe avatar',
            data: { kind: 'actor', tag: undefined },
        },
    ] as const)('renders Safe-branded $name', ({ data }) => {
        const { container } = renderGraphNode({
            brandId: 'safe',
            label: 'Safe',
            ...data,
        });

        expect(screen.getByText('Safe')).toBeInTheDocument();
        expect(screen.getByLabelText('Safe account')).toBeInTheDocument();
        expect(container.textContent).not.toContain('SAFE');
    });

    it('renders Anyone actor nodes with the primary members icon', () => {
        renderGraphNode({
            address: ANY_ADDR,
            kind: 'actor',
            label: 'Anyone',
            tag: undefined,
        });

        expect(screen.getByText('Anyone')).toBeInTheDocument();
        expect(screen.getByLabelText('Members')).toBeInTheDocument();
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

    it('keeps the routed stack node box fitted to the visible permission pills', () => {
        const { container } = renderStackNode();
        const stackNode = container.firstElementChild;

        expect(stackNode).toHaveClass('w-fit');
        expect(stackNode).not.toHaveClass('w-60');
    });
});
