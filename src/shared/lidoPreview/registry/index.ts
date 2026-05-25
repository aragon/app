// Vendored from dao-launchpad@f/lido-demo:lido/preview/lib/src — do not edit by hand.
// See infra/lmm-demo/README.md → "Updating vendored libs" for the refresh procedure.
// Upstream package: @aragon/lido-preview (private).

// Registry of known components. Each built-in registers itself on import.
// Unknown *Id() strings are served by the `unknown-*` inspectors, which live
// here too (registered with an empty id that dispatch functions never match).

import type {
    BudgetInspector,
    PluginInspector,
    SplitterInspector,
    StrategyInspector,
    StrategyPredictor,
} from './types';

const plugins = new Map<string, PluginInspector>();
const strategies = new Map<string, StrategyInspector>();
const budgets = new Map<string, BudgetInspector>();
const splitters = new Map<string, SplitterInspector>();
const predictors = new Map<string, StrategyPredictor>();

// Registration --------------------------------------------------------------

export function registerPlugin(inspector: PluginInspector): void {
    plugins.set(inspector.id, inspector);
}

export function registerStrategy(inspector: StrategyInspector): void {
    strategies.set(inspector.id, inspector);
}

export function registerBudget(inspector: BudgetInspector): void {
    budgets.set(inspector.id, inspector);
}

export function registerSplitter(inspector: SplitterInspector): void {
    splitters.set(inspector.id, inspector);
}

export function registerPredictor(predictor: StrategyPredictor): void {
    predictors.set(predictor.kind, predictor);
}

// Lookup --------------------------------------------------------------------

export function findPlugin(id: string): PluginInspector | undefined {
    return plugins.get(id);
}

export function findStrategy(id: string): StrategyInspector | undefined {
    return strategies.get(id);
}

export function findBudget(id: string): BudgetInspector | undefined {
    return budgets.get(id);
}

export function findSplitter(id: string): SplitterInspector | undefined {
    return splitters.get(id);
}

export function findPredictor(kind: string): StrategyPredictor | undefined {
    return predictors.get(kind);
}

// Introspection --------------------------------------------------------------

/** Every plugin id the registry can inspect specifically (not via unknown fallback). */
export function listPluginIds(): string[] {
    return [...plugins.keys()];
}

export function listStrategyIds(): string[] {
    return [...strategies.keys()];
}

export function listBudgetIds(): string[] {
    return [...budgets.keys()];
}

export function listSplitterIds(): string[] {
    return [...splitters.keys()];
}

export type * from './types';
