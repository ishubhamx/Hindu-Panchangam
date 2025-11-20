// src/index.ts
import { Observer, Body, GeoVector, Ecliptic, SearchRiseSet } from "astronomy-engine";

// Re-export astronomy-engine classes and functions that are essential for the package
export { Observer, Body, GeoVector, Ecliptic, SearchRiseSet };

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

// Re-export ayanamsa utilities for advanced users
export { getLahiriAyanamsa, tropicalToSidereal, getAyanamsaInfo } from './ayanamsa';
