import { LinearClient } from '@linear/sdk';
import { env } from '../lib/env';

// Seam over the Linear SDK: routes and tests only consume this interface.
export interface ILinearGateway {
    createIssue: (input: {
        title: string;
        description: string;
        labelName: string;
    }) => Promise<{ issueId: string; identifier: string; url: string }>;
    // Files the engineering issue for a support ticket into the engineering team's triage and
    // makes the ticket its sub-issue: closing the engineering issue closes the ticket (Linear's
    // sub-issue auto-close), and several tickets about one bug can be re-parented onto one
    // issue. Resolves to undefined when no triage team is configured.
    createTriageParent: (input: {
        childIssueId: string;
        title: string;
        description: string;
    }) => Promise<{ identifier: string } | undefined>;
    uploadFile: (input: {
        filename: string;
        contentType: string;
        size: number;
        data: Uint8Array;
    }) => Promise<{ assetUrl: string }>;
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

    // The triage team's Triage status, resolved once per cold start. Passed explicitly: an issue
    // the API creates lands in Triage only when the key's user is outside the team.
    const triageTeamId = env.linearTriageTeamId();
    let triageStateId: Promise<string | undefined> | undefined;
    const getTriageStateId = (teamIdToResolve: string) => {
        triageStateId ??= (async () => {
            const team = await client.team(teamIdToResolve);
            const states = await team.states();

            return states.nodes.find((state) => state.type === 'triage')?.id;
        })();

        return triageStateId;
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
        createTriageParent: async ({ childIssueId, title, description }) => {
            if (triageTeamId == null) {
                return undefined;
            }

            const stateId = await getTriageStateId(triageTeamId);
            const payload = await client.createIssue({
                teamId: triageTeamId,
                stateId,
                title,
                description,
            });
            const issue = await payload.issue;

            if (!(payload.success && issue != null)) {
                throw new Error('Linear triage parent creation failed');
            }

            const update = await client.updateIssue(childIssueId, {
                parentId: issue.id,
            });

            if (!update.success) {
                throw new Error('Linear sub-issue link failed');
            }

            return { identifier: issue.identifier };
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
