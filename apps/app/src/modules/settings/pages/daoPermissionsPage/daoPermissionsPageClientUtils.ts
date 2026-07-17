import type { GraphMode } from '../../components/permissionsGraph';
import type { IPermissionRow } from '../../types';

export type DisplayGraphMode = Extract<GraphMode, 'incoming' | 'other'>;

export const graphModes: DisplayGraphMode[] = ['incoming', 'other'];

export const filterRowsByMode = (
    rows: IPermissionRow[],
    mode: GraphMode,
    activeAccountAddress?: string,
) => {
    const activeAddress = activeAccountAddress?.toLowerCase();

    if (activeAddress == null) {
        return rows;
    }

    return rows.filter((row) => {
        const whoAddress = row.whoAddress.toLowerCase();
        const whereAddress = row.whereAddress.toLowerCase();

        if (mode === 'incoming') {
            return whereAddress === activeAddress;
        }

        if (mode === 'outgoing') {
            return whoAddress === activeAddress;
        }

        return whereAddress !== activeAddress;
    });
};
