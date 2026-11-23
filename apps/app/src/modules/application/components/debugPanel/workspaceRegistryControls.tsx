'use client';

import { Button, Heading } from '@aragon/gov-ui-kit';
import { useDisconnect } from '@reown/appkit/react';
import { type ChangeEvent, useRef, useState } from 'react';
import { workspaceService } from '@/modules/workspace/api/workspaceService';

const buildExportFilename = () =>
    `aragon-workspaces-${new Date().toISOString().slice(0, 19).replaceAll(':', '-')}Z.json`;

export const WorkspaceRegistryControls: React.FC = () => {
    const inputRef = useRef<HTMLInputElement>(null);
    const [error, setError] = useState<string>();
    const { disconnect } = useDisconnect();

    const handleExport = async () => {
        const registry = await workspaceService.exportWorkspaceRegistry();
        const url = URL.createObjectURL(
            new Blob([registry], { type: 'application/json' }),
        );
        const link = document.createElement('a');
        link.download = buildExportFilename();
        link.href = url;
        link.click();
        window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    };

    const handleImport = async (event: ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        event.target.value = '';

        if (
            file == null ||
            !window.confirm(
                'Replace every local workspace with the selected registry?',
            )
        ) {
            return;
        }

        try {
            await workspaceService.importWorkspaceRegistry(await file.text());
            window.location.assign('/workspace');
        } catch (error: unknown) {
            setError(error instanceof Error ? error.message : String(error));
        }
    };

    const handleDelete = async () => {
        if (
            !window.confirm('Delete every local workspace from this browser?')
        ) {
            return;
        }

        try {
            await workspaceService.deleteWorkspaceRegistry();
        } catch (error: unknown) {
            setError(error instanceof Error ? error.message : String(error));
            return;
        }

        // Disconnects, or the landing page sends the wallet straight back to `/workspace`; leaves even if that fails.
        await disconnect().catch(() => undefined);
        window.location.assign('/');
    };

    return (
        <section className="flex flex-col gap-2">
            <Heading size="h3">Workspace registry</Heading>
            <p className="text-sm leading-normal text-neutral-500">
                Save, restore or delete the local workspace JSON for this
                environment.
            </p>
            <div className="flex flex-wrap gap-2">
                <Button onClick={handleExport} size="sm" variant="secondary">
                    Export JSON
                </Button>
                <Button
                    onClick={() => inputRef.current?.click()}
                    size="sm"
                    variant="secondary"
                >
                    Import JSON
                </Button>
                <Button onClick={handleDelete} size="sm" variant="critical">
                    Delete workspaces
                </Button>
            </div>
            <input
                accept="application/json,.json"
                className="hidden"
                onChange={handleImport}
                ref={inputRef}
                type="file"
            />
            {error != null && (
                <p className="text-sm text-critical-500" role="alert">
                    {error}
                </p>
            )}
        </section>
    );
};
