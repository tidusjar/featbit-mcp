import fetch from 'node-fetch';
/**
 * FeatBit API client for interacting with FeatBit REST API
 */
export class FeatBitClient {
    config;
    constructor(config) {
        this.config = config;
    }
    /**
     * Get the base URL for API requests
     */
    getApiUrl(path) {
        const baseUrl = this.config.serverUrl.replace(/\/$/, '');
        return `${baseUrl}/api/v1${path}`;
    }
    /**
     * Make an authenticated request to the FeatBit API
     */
    async makeRequest(path, options = {}) {
        try {
            const url = this.getApiUrl(path);
            const response = await fetch(url, {
                ...options,
                headers: {
                    'Authorization': `Bearer ${this.config.apiKey}`,
                    'Content-Type': 'application/json',
                    ...options.headers,
                },
            });
            if (!response.ok) {
                return {
                    success: false,
                    error: `HTTP ${response.status}: ${response.statusText}`,
                };
            }
            const data = await response.json();
            return {
                success: true,
                data,
            };
        }
        catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error',
            };
        }
    }
    /**
     * List all feature flags for the environment
     */
    async listFeatureFlags() {
        return this.makeRequest(`/envs/${this.config.envKey}/feature-flags`);
    }
    /**
     * Get a specific feature flag by key
     */
    async getFeatureFlag(flagKey) {
        return this.makeRequest(`/envs/${this.config.envKey}/feature-flags/${flagKey}`);
    }
    /**
     * Evaluate a feature flag for a specific user
     */
    async evaluateFeatureFlag(flagKey, user) {
        return this.makeRequest(`/envs/${this.config.envKey}/feature-flags/${flagKey}/evaluate`, {
            method: 'POST',
            body: JSON.stringify({ user }),
        });
    }
    /**
     * Evaluate multiple feature flags for a user
     */
    async evaluateFeatureFlags(flagKeys, user) {
        return this.makeRequest(`/envs/${this.config.envKey}/feature-flags/evaluate`, {
            method: 'POST',
            body: JSON.stringify({
                user,
                flagKeys
            }),
        });
    }
    /**
     * Get all feature flag values for a user (simplified evaluation)
     */
    async getAllFeatureFlagValues(user) {
        return this.makeRequest(`/envs/${this.config.envKey}/feature-flags/values`, {
            method: 'POST',
            body: JSON.stringify({ user }),
        });
    }
}
//# sourceMappingURL=featbit-client.js.map