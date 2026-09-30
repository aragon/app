import * as React from 'react';

/**
 * Wizard — from @aragon/app@1.39.1 (apps/app/src/shared/components/wizards/wizard/index.ts).
 */
export interface WizardProps {

}

import type { CSSProperties } from 'react';
import type { FieldValues } from 'react-hook-form';

export interface IWizardStepperStep
    extends IStepperStep<IWizardContainerStepMeta> {}

export interface IWizardContainerStepMeta {
    /**
     * Name of the step.
     */
    name: string;
}

export interface IStepperStep<TMeta = undefined, TStepId = string> {
    /**
     * ID of the step.
     */
    id: TStepId;
    /**
     * Order of the step inside the steps array.
     */
    order: number;
    /**
     * Metadata of the step.
     */
    meta: TMeta;
}

export interface IWizardAnalytics {
    /**
     * Product flow represented by the wizard.
     */
    flow: string;
    /**
     * Low-cardinality, privacy-safe event properties shared by wizard events.
     */
    props?: PlausibleAnalyticsProps;
}

export type PlausibleAnalyticsProps = Record<
    string,
    PlausibleAnalyticsPropValue | null | undefined
>;

export type PlausibleAnalyticsPropValue = string | number | boolean;

export interface WizardFormProps<TFormData extends FieldValues = FieldValues> {
  /** Callback called at the end of the wizard with the form data when the form is valid. */
  onSubmit?: (data: TFormData) => void;
  /** Allows getting a ref to the component instance. Once the component unmounts, React will set `ref.current` to `null` (or  */
  ref?: unknown;
  children?: React.ReactNode;
  id?: string;
  className?: string;
  style?: CSSProperties;
  /** Specify styles using Tailwind CSS classes. This feature is currently experimental. If `style` prop is also specified, st */
  tw?: string;
}

export interface WizardRootProps<TFormData extends FieldValues = FieldValues> {
  /** Initial steps of the wizard used to populate the steps array. */
  initialSteps?: IWizardStepperStep[];
  /** Label for the submit button at the end of the wizard. */
  submitLabel: string;
  /** Help text to be displayed under the submit button at the end of the wizard. */
  submitHelpText?: string;
  /** Default values for the form. */
  defaultValues?: any;
  /** Renders the form library dev-tool when set to true. */
  useDevTool?: boolean;
  /** Optional analytics metadata for stepper-level product telemetry. */
  analytics?: IWizardAnalytics;
  /** Children of the component. */
  children?: React.ReactNode;
}

export interface WizardStepProps {
  /** Hides the step when set to true. */
  hidden?: boolean;
  /** Flag to override the default scroll behavior of the wizard step, primarily when step is inside a dialog. */
  disableScrollToTop?: boolean;
  /** ID of the step. */
  id: string;
  /** Order of the step inside the steps array. */
  order: number;
  /** Metadata of the step. */
  meta: IWizardContainerStepMeta;
  /** Allows getting a ref to the component instance. Once the component unmounts, React will set `ref.current` to `null` (or  */
  ref?: unknown;
  children?: React.ReactNode;
  className?: string;
  style?: CSSProperties;
  /** Specify styles using Tailwind CSS classes. This feature is currently experimental. If `style` prop is also specified, st */
  tw?: string;
}

export declare const Wizard: {
  Form: React.ComponentType<WizardFormProps>;
  Root: React.ComponentType<WizardRootProps>;
  Step: React.ComponentType<WizardStepProps>;
};
