import * as React from 'react';

/**
 * Heading — from @aragon/gov-ui-kit@2.10.0.
 */
export interface HeadingProps {
  /** Specifies the semantic level of the heading, affecting both the HTML element used (e.g., <h1>, <h2>) and its default sty */
  size?: "h1" | "h2" | "h3" | "h4" | "h5";
  /** Optionally overrides the HTML element type that is rendered in the DOM, independent of the heading's semantic level dete */
  as?: "h1" | "h2" | "h3" | "h4" | "h5";
  className?: string;
  id?: string;
  style?: CSSProperties;
  children?: React.ReactNode;
  /** Allows getting a ref to the component instance. Once the component unmounts, React will set `ref.current` to `null` (or  */
  ref?: React.Ref;
}

export declare const Heading: React.ComponentType<HeadingProps>;
