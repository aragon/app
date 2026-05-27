// LMM_DEMO_HACK: thin wrapper around StatusView.  Used to host a custom
// resizable chrome; we removed that to keep the page short and match the
// Aragon visual language.  Kept as a separate component so the
// `LmmPolicyTopology` callsite stays familiar and future demo-only chrome
// (e.g. a refresh button) has a place to live.

import { StatusView } from './StatusView';
import type { StatusSnapshot } from './useStatus';

export const StatusPanel: React.FC<{ snapshot?: StatusSnapshot }> = ({
    snapshot,
}) => <StatusView snapshot={snapshot} />;
