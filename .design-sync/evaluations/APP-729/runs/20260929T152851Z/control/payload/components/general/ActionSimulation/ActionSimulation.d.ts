import * as React from 'react';

/**
 * ActionSimulation — from @aragon/gov-ui-kit@2.10.0.
 */
export interface ActionSimulationProps {
  /** Total number of actions in the proposal. */
  totalActions: number;
  /** Last simulation data including timestamp, URL, and status. */
  lastSimulation?: IActionSimulationRun;
  /** Whether simulation is currently running. */
  isLoading?: boolean;
  /** Whether the proposal can be simulated. */
  isEnabled?: boolean;
  /** Callback when simulate again button is clicked. */
  onSimulate?: () => void;
  /** Additional class names applied to the wrapper div. */
  className?: string;
  /** Optional error message to display. */
  error?: string;
}

export declare const ActionSimulation: React.ComponentType<ActionSimulationProps>;
