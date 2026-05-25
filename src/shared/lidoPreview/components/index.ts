// Vendored from dao-launchpad@f/lido-demo:lido/preview/lib/src — do not edit by hand.
// See infra/lmm-demo/README.md → "Updating vendored libs" for the refresh procedure.
// Upstream package: @aragon/lido-preview (private).

// Side-effect barrel: importing this file registers every built-in
// component with the registry. Adding a new component = one import.
//
// The CR vanilla components are kept as catch-alls — they're harmless when
// the active deployment doesn't use them (the registry only looks them up
// when an inspected component reports their `*Id`).  Lido-specific
// components live alongside.

// Splitters (CR — unused by the LMM but kept so mixed deployments don't
// fall through to unknown unnecessarily)
import './splitters/soloSplitter';
import './splitters/equalSplitter';
import './splitters/ratioSplitter';

// Budgets — CR (FullBudget / RequiredBudget) + Lido (StreamUntilBudget).
import './budgets/fullBudget';
import './budgets/requiredBudget';
import './budgets/streamUntilBudget';

// Strategies — CR (Transfer / Burn / EpochTransfer) + Lido (Wrap, UniV2, GatedCowSwap).
import './strategies/burnDispatch';
import './strategies/transferDispatch';
import './strategies/epochTransferDispatch';
import './strategies/lidoWrap';
import './strategies/lidoUniV2Liquidity';
import './strategies/lidoGatedCowSwap';

// Plugins
import './plugins/dispatcherPlugin';
