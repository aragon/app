import { LinearClient } from '@linear/sdk';
import { env } from '../lib/env';

// Seam over the Linear SDK: routes and tests only consume this interface.
export interface ILinearGateway {
    createIssue(input: {
        title: string;
        description: string;
        labelName: string;
    }): Promise<{ issueId: string; identifier: string; url: string }>;
    uploadFile(input: {
        filename: string;
        contentType: string;
        size: number;
        data: Uint8Array;
    }): Promise<{ assetUrl: string }>;
}

export const createLinearGateway = (): ILinearGateway => {
    const client = new LinearClient({ apiKey: env.linearApiKey() });
    const teamId = env.linearTeamId();

    if (teamId == null) {
        throw new Error('LINEAR_TEAM_ID is not configured');
    }

    // Label ids are resolved by name once per cold start and cached for the instance lifetime.
    let labelIdsByName: Promise<Map<string, string>> | undefined;
    const getLabelIds = () => {
        labelIdsByName ??= (async () => {
            const team = await client.team(teamId);
            const labels = await team.labels();

            return new Map(labels.nodes.map((label) => [label.name, label.id]));
        })();

        return labelIdsByName;
    };

    return {
        createIssue: async ({ title, description, labelName }) => {
            const labelIds = await getLabelIds();
            const labelId = labelIds.get(labelName);

            const payload = await client.createIssue({
                teamId,
                title,
                description,
                labelIds: labelId == null ? undefined : [labelId],
            });
            const issue = await payload.issue;

            if (!(payload.success && issue != null)) {
                throw new Error('Linear issue creation failed');
            }

            return {
                issueId: issue.id,
                identifier: issue.identifier,
                url: issue.url,
            };
        },
        uploadFile: async ({ filename, contentType, size, data }) => {
            const payload = await client.fileUpload(
                contentType,
                filename,
                size,
            );
            const upload = payload.uploadFile;

            if (!(payload.success && upload != null)) {
                throw new Error('Linear file upload failed');
            }

            const headers = new Headers({ 'content-type': contentType });
            for (const header of upload.headers) {
                headers.set(header.key, header.value);
            }

            const response = await fetch(upload.uploadUrl, {
                method: 'PUT',
                headers,
                body: data,
            });

            if (!response.ok) {
                throw new Error(
                    `Linear file upload failed with status ${response.status}`,
                );
            }

            return { assetUrl: upload.assetUrl };
        },
    };
};
