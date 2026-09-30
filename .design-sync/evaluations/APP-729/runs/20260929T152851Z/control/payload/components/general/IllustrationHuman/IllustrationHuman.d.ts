import * as React from 'react';

/**
 * IllustrationHuman — from @aragon/gov-ui-kit@2.10.0.
 */
export interface IllustrationHumanProps {
  /** Body of the illustration human. */
  body: "ARAGON" | "BLOCKS" | "CHART" | "COMPUTER_CORRECT" | "COMPUTER" | "CORRECT" | "DOUBLE_CORRECT" | "ELEVATING" | "RELAXED" | "SENDING_LOVE" | "VOTING";
  /** Expression of the illustration human. */
  expression: "ANGRY" | "CASUAL" | "CRYING" | "DECIDED" | "EXCITED" | "SAD_LEFT" | "SAD_RIGHT" | "SMILE_WINK" | "SMILE" | "SURPRISED" | "SUSPECTING";
  /** Hairs of the illustration human. */
  hairs?: "AFRO" | "BALD" | "BUN" | "COOL" | "CURLY_BANGS" | "CURLY" | "INFORMAL" | "LONG" | "MIDDLE" | "OLDSCHOOL" | "PUNK" | "SHORT";
  /** Sunglasses of the illustration human. */
  sunglasses?: "BIG_ROUNDED" | "BIG_SEMIROUNDED" | "LARGE_STYLIZED_XL" | "LARGE_STYLIZED" | "PIRATE" | "SMALL_INTELLECTUAL" | "SMALL_SYMPATHETIC" | "SMALL_WEIRD_ONE" | "SMALL_WEIRD_TWO" | "THUGLIFE_ROUNDED" | "THUGLIFE";
  /** Accessory of the illustration human. */
  accessory?: "BUDDHA" | "EARRINGS_CIRCLE" | "EARRINGS_HOOPS" | "EARRINGS_RHOMBUS" | "EARRINGS_SKULL" | "EARRINGS_THUNDER" | "EXPRESSION" | "FLUSHED" | "HEAD_FLOWER" | "PIERCINGS_TATTOO" | "PIERCINGS";
  /** Object to be displayed. */
  object?: unknown;
  /** Position of the object. */
  objectPosition?: "right" | "left";
  className?: string;
  id?: string;
  style?: CSSProperties;
  children?: React.ReactNode;
}

export declare const IllustrationHuman: React.ComponentType<IllustrationHumanProps>;
