import { render } from '@testing-library/react';
import { ReactFlowProvider } from '@xyflow/react';
import type { ComponentProps } from 'react';
import { PermissionStackNode } from './permissionGraphNode';

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
