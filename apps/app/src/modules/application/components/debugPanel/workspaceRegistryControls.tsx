'use client';

import { Button, Heading } from '@aragon/gov-ui-kit';
import { type ChangeEvent, useRef, useState } from 'react';
import { workspaceService } from '@/modules/workspace/api/workspaceService';

const exportFilename = 'aragon-workspaces.json';

export const WorkspaceRegistryControls: React.FC = () => {
    const inputRef = useRef<HTMLInputElement>(null);
    const [error, setError] = useState<string>();

    const handleExport = async () => {
        const registry = await workspaceService.exportWorkspaceRegistry();
        const url = URL.createObjectURL(
            new Blob([registry], { type: 'application/json' }),
        );
        const link = document.createElement('a');
        link.download = exportFilename;
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

    return (
        <section className="flex flex-col gap-2">
            <Heading size="h3">Workspace registry</Heading>
            <p className="text-neutral-500 text-sm leading-normal">
                Save or restore the local workspace JSON for this environment.
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
            </div>
            <input
                accept="application/json,.json"
                className="hidden"
                onChange={handleImport}
                ref={inputRef}
                type="file"
            />
            {error != null && (
                <p className="text-critical-500 text-sm" role="alert">
                    {error}
                </p>
            )}
        </section>
    );
};
