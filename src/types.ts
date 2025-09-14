/**
 * FeatBit API types and interfaces
 */

export interface FeatBitConfig {
  /** FeatBit server URL */
  serverUrl: string;
  /** API key for authentication */
  apiKey: string;
  /** Environment key */
  envKey: string;
}

export interface User {
  /** Unique identifier for the user */
  keyId: string;
  /** Display name for the user */
  name?: string;
  /** Custom properties for the user */
  customizedProperties?: Record<string, any>;
}

export interface FeatureFlag {
  /** Unique identifier for the feature flag */
  id: string;
  /** Key of the feature flag */
  key: string;
  /** Name of the feature flag */
  name: string;
  /** Description of the feature flag */
  description?: string;
  /** Whether the flag is enabled */
  isEnabled: boolean;
  /** Variations available for this flag */
  variations: Variation[];
  /** Default variation for when flag is disabled */
  disabledVariation?: Variation;
  /** Default variation for when flag is enabled */
  enabledVariation?: Variation;
  /** Tags associated with the flag */
  tags?: string[];
}

export interface Variation {
  /** Unique identifier for the variation */
  id: string;
  /** Name of the variation */
  name: string;
  /** Value of the variation */
  value: any;
}

export interface FeatureFlagEvaluation {
  /** The feature flag key */
  flagKey: string;
  /** The evaluated value */
  value: any;
  /** The variation that was selected */
  variation?: Variation;
  /** Reason for the evaluation result */
  reason?: string;
  /** Whether the flag was found */
  flagFound: boolean;
}

export interface FeatBitResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface ListFeatureFlagsResponse {
  items: FeatureFlag[];
  totalCount: number;
}