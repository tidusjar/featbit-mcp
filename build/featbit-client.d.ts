import { FeatBitConfig, User, FeatureFlag, FeatureFlagEvaluation, FeatBitResponse, ListFeatureFlagsResponse } from './types.js';
/**
 * FeatBit API client for interacting with FeatBit REST API
 */
export declare class FeatBitClient {
    private config;
    constructor(config: FeatBitConfig);
    /**
     * Get the base URL for API requests
     */
    private getApiUrl;
    /**
     * Make an authenticated request to the FeatBit API
     */
    private makeRequest;
    /**
     * List all feature flags for the environment
     */
    listFeatureFlags(): Promise<FeatBitResponse<ListFeatureFlagsResponse>>;
    /**
     * Get a specific feature flag by key
     */
    getFeatureFlag(flagKey: string): Promise<FeatBitResponse<FeatureFlag>>;
    /**
     * Evaluate a feature flag for a specific user
     */
    evaluateFeatureFlag(flagKey: string, user: User): Promise<FeatBitResponse<FeatureFlagEvaluation>>;
    /**
     * Evaluate multiple feature flags for a user
     */
    evaluateFeatureFlags(flagKeys: string[], user: User): Promise<FeatBitResponse<FeatureFlagEvaluation[]>>;
    /**
     * Get all feature flag values for a user (simplified evaluation)
     */
    getAllFeatureFlagValues(user: User): Promise<FeatBitResponse<Record<string, any>>>;
}
//# sourceMappingURL=featbit-client.d.ts.map