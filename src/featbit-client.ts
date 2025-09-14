import fetch from 'node-fetch';
import {
  FeatBitConfig,
  User,
  FeatureFlag,
  FeatureFlagEvaluation,
  FeatBitResponse,
  ListFeatureFlagsResponse,
} from './types.js';

/**
 * FeatBit API client for interacting with FeatBit REST API
 */
export class FeatBitClient {
  private config: FeatBitConfig;

  constructor(config: FeatBitConfig) {
    this.config = config;
  }

  /**
   * Get the base URL for API requests
   */
  private getApiUrl(path: string): string {
    const baseUrl = this.config.serverUrl.replace(/\/$/, '');
    return `${baseUrl}/api/v1${path}`;
  }

  /**
   * Make an authenticated request to the FeatBit API
   */
  private async makeRequest<T>(
    path: string,
    options: any = {}
  ): Promise<FeatBitResponse<T>> {
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

      const data = await response.json() as T;
      return {
        success: true,
        data,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * List all feature flags for the environment
   */
  async listFeatureFlags(): Promise<FeatBitResponse<ListFeatureFlagsResponse>> {
    return this.makeRequest<ListFeatureFlagsResponse>(
      `/envs/${this.config.envKey}/feature-flags`
    );
  }

  /**
   * Get a specific feature flag by key
   */
  async getFeatureFlag(flagKey: string): Promise<FeatBitResponse<FeatureFlag>> {
    return this.makeRequest<FeatureFlag>(
      `/envs/${this.config.envKey}/feature-flags/${flagKey}`
    );
  }

  /**
   * Evaluate a feature flag for a specific user
   */
  async evaluateFeatureFlag(
    flagKey: string,
    user: User
  ): Promise<FeatBitResponse<FeatureFlagEvaluation>> {
    return this.makeRequest<FeatureFlagEvaluation>(
      `/envs/${this.config.envKey}/feature-flags/${flagKey}/evaluate`,
      {
        method: 'POST',
        body: JSON.stringify({ user }),
      }
    );
  }

  /**
   * Evaluate multiple feature flags for a user
   */
  async evaluateFeatureFlags(
    flagKeys: string[],
    user: User
  ): Promise<FeatBitResponse<FeatureFlagEvaluation[]>> {
    return this.makeRequest<FeatureFlagEvaluation[]>(
      `/envs/${this.config.envKey}/feature-flags/evaluate`,
      {
        method: 'POST',
        body: JSON.stringify({ 
          user,
          flagKeys 
        }),
      }
    );
  }

  /**
   * Get all feature flag values for a user (simplified evaluation)
   */
  async getAllFeatureFlagValues(
    user: User
  ): Promise<FeatBitResponse<Record<string, any>>> {
    return this.makeRequest<Record<string, any>>(
      `/envs/${this.config.envKey}/feature-flags/values`,
      {
        method: 'POST',
        body: JSON.stringify({ user }),
      }
    );
  }
}