// src/index.ts
import { Observer } from "astronomy-engine";

// Main exports for the panchangam-js package
export { getPanchangam, getPanchangamDetails } from './panchangam';

// Re-export types
export type { 
  Panchangam,
  PanchangamDetails,
  KaranaTransition
} from './panchangam';

// Re-export constants
export { karanaNames, yogaNames, tithiNames, nakshatraNames } from './panchangam';
