#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { FeatBitClient } from './featbit-client.js';
import { FeatBitConfig, User } from './types.js';

/**
 * FeatBit MCP Server
 * Provides tools for interacting with FeatBit feature flags
 */
class FeatBitMCPServer {
  private server: Server;
  private featbitClient: FeatBitClient | null = null;

  constructor() {
    this.server = new Server(
      {
        name: 'featbit-mcp',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.setupHandlers();
  }

  private setupHandlers() {
    // List available tools
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: [
          {
            name: 'configure_featbit',
            description: 'Configure FeatBit connection settings (server URL, API key, environment)',
            inputSchema: {
              type: 'object',
              properties: {
                serverUrl: {
                  type: 'string',
                  description: 'FeatBit server URL (e.g., https://app.featbit.co)',
                },
                apiKey: {
                  type: 'string',
                  description: 'FeatBit API key for authentication',
                },
                envKey: {
                  type: 'string',
                  description: 'Environment key (e.g., prod, dev, staging)',
                },
              },
              required: ['serverUrl', 'apiKey', 'envKey'],
            },
          },
          {
            name: 'list_feature_flags',
            description: 'List all feature flags in the configured environment',
            inputSchema: {
              type: 'object',
              properties: {},
            },
          },
          {
            name: 'get_feature_flag',
            description: 'Get details of a specific feature flag',
            inputSchema: {
              type: 'object',
              properties: {
                flagKey: {
                  type: 'string',
                  description: 'The key of the feature flag to retrieve',
                },
              },
              required: ['flagKey'],
            },
          },
          {
            name: 'evaluate_feature_flag',
            description: 'Evaluate a feature flag for a specific user',
            inputSchema: {
              type: 'object',
              properties: {
                flagKey: {
                  type: 'string',
                  description: 'The key of the feature flag to evaluate',
                },
                user: {
                  type: 'object',
                  properties: {
                    keyId: {
                      type: 'string',
                      description: 'Unique identifier for the user',
                    },
                    name: {
                      type: 'string',
                      description: 'Display name for the user',
                    },
                    customizedProperties: {
                      type: 'object',
                      description: 'Custom properties for the user',
                    },
                  },
                  required: ['keyId'],
                },
              },
              required: ['flagKey', 'user'],
            },
          },
          {
            name: 'evaluate_multiple_flags',
            description: 'Evaluate multiple feature flags for a specific user',
            inputSchema: {
              type: 'object',
              properties: {
                flagKeys: {
                  type: 'array',
                  items: { type: 'string' },
                  description: 'Array of feature flag keys to evaluate',
                },
                user: {
                  type: 'object',
                  properties: {
                    keyId: {
                      type: 'string',
                      description: 'Unique identifier for the user',
                    },
                    name: {
                      type: 'string',
                      description: 'Display name for the user',
                    },
                    customizedProperties: {
                      type: 'object',
                      description: 'Custom properties for the user',
                    },
                  },
                  required: ['keyId'],
                },
              },
              required: ['flagKeys', 'user'],
            },
          },
          {
            name: 'get_all_flag_values',
            description: 'Get all feature flag values for a specific user',
            inputSchema: {
              type: 'object',
              properties: {
                user: {
                  type: 'object',
                  properties: {
                    keyId: {
                      type: 'string',
                      description: 'Unique identifier for the user',
                    },
                    name: {
                      type: 'string',
                      description: 'Display name for the user',
                    },
                    customizedProperties: {
                      type: 'object',
                      description: 'Custom properties for the user',
                    },
                  },
                  required: ['keyId'],
                },
              },
              required: ['user'],
            },
          },
        ],
      };
    });

    // Handle tool calls
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      try {
        switch (name) {
          case 'configure_featbit':
            return this.configureFeatBit(args as any);

          case 'list_feature_flags':
            return this.listFeatureFlags();

          case 'get_feature_flag':
            return this.getFeatureFlag(args as { flagKey: string });

          case 'evaluate_feature_flag':
            return this.evaluateFeatureFlag(args as { flagKey: string; user: User });

          case 'evaluate_multiple_flags':
            return this.evaluateMultipleFlags(args as { flagKeys: string[]; user: User });

          case 'get_all_flag_values':
            return this.getAllFlagValues(args as { user: User });

          default:
            throw new Error(`Unknown tool: ${name}`);
        }
      } catch (error) {
        return {
          content: [
            {
              type: 'text',
              text: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
            },
          ],
        };
      }
    });
  }

  private async configureFeatBit(config: any) {
    this.featbitClient = new FeatBitClient(config);
    
    return {
      content: [
        {
          type: 'text',
          text: `✅ FeatBit configured successfully!\nServer: ${config.serverUrl}\nEnvironment: ${config.envKey}`,
        },
      ],
    };
  }

  private async listFeatureFlags() {
    if (!this.featbitClient) {
      throw new Error('FeatBit not configured. Please run configure_featbit first.');
    }

    const response = await this.featbitClient.listFeatureFlags();
    
    if (!response.success) {
      throw new Error(`Failed to list feature flags: ${response.error}`);
    }

    const flags = response.data?.items || [];
    const flagList = flags.map(flag => 
      `🚩 **${flag.key}** (${flag.name})\n   Status: ${flag.isEnabled ? '✅ Enabled' : '❌ Disabled'}\n   Description: ${flag.description || 'No description'}`
    ).join('\n\n');

    return {
      content: [
        {
          type: 'text',
          text: `## Feature Flags (${flags.length} total)\n\n${flagList}`,
        },
      ],
    };
  }

  private async getFeatureFlag(args: { flagKey: string }) {
    if (!this.featbitClient) {
      throw new Error('FeatBit not configured. Please run configure_featbit first.');
    }

    const response = await this.featbitClient.getFeatureFlag(args.flagKey);
    
    if (!response.success) {
      throw new Error(`Failed to get feature flag: ${response.error}`);
    }

    const flag = response.data!;
    const variations = flag.variations?.map(v => `- **${v.name}**: ${JSON.stringify(v.value)}`).join('\n') || 'None';

    return {
      content: [
        {
          type: 'text',
          text: `## Feature Flag: ${flag.key}\n\n**Name:** ${flag.name}\n**Status:** ${flag.isEnabled ? '✅ Enabled' : '❌ Disabled'}\n**Description:** ${flag.description || 'No description'}\n\n**Variations:**\n${variations}`,
        },
      ],
    };
  }

  private async evaluateFeatureFlag(args: { flagKey: string; user: User }) {
    if (!this.featbitClient) {
      throw new Error('FeatBit not configured. Please run configure_featbit first.');
    }

    const response = await this.featbitClient.evaluateFeatureFlag(args.flagKey, args.user);
    
    if (!response.success) {
      throw new Error(`Failed to evaluate feature flag: ${response.error}`);
    }

    const evaluation = response.data!;

    return {
      content: [
        {
          type: 'text',
          text: `## Feature Flag Evaluation: ${args.flagKey}\n\n**User:** ${args.user.keyId} (${args.user.name || 'No name'})\n**Value:** ${JSON.stringify(evaluation.value)}\n**Variation:** ${evaluation.variation?.name || 'None'}\n**Reason:** ${evaluation.reason || 'No reason provided'}\n**Flag Found:** ${evaluation.flagFound ? '✅ Yes' : '❌ No'}`,
        },
      ],
    };
  }

  private async evaluateMultipleFlags(args: { flagKeys: string[]; user: User }) {
    if (!this.featbitClient) {
      throw new Error('FeatBit not configured. Please run configure_featbit first.');
    }

    const response = await this.featbitClient.evaluateFeatureFlags(args.flagKeys, args.user);
    
    if (!response.success) {
      throw new Error(`Failed to evaluate feature flags: ${response.error}`);
    }

    const evaluations = response.data!;
    const results = evaluations.map(evaluation => 
      `🚩 **${evaluation.flagKey}**: ${JSON.stringify(evaluation.value)} ${evaluation.flagFound ? '✅' : '❌'}`
    ).join('\n');

    return {
      content: [
        {
          type: 'text',
          text: `## Multiple Flag Evaluation\n\n**User:** ${args.user.keyId} (${args.user.name || 'No name'})\n\n${results}`,
        },
      ],
    };
  }

  private async getAllFlagValues(args: { user: User }) {
    if (!this.featbitClient) {
      throw new Error('FeatBit not configured. Please run configure_featbit first.');
    }

    const response = await this.featbitClient.getAllFeatureFlagValues(args.user);
    
    if (!response.success) {
      throw new Error(`Failed to get all flag values: ${response.error}`);
    }

    const values = response.data!;
    const valueList = Object.entries(values).map(([key, value]) => 
      `🚩 **${key}**: ${JSON.stringify(value)}`
    ).join('\n');

    return {
      content: [
        {
          type: 'text',
          text: `## All Feature Flag Values\n\n**User:** ${args.user.keyId} (${args.user.name || 'No name'})\n\n${valueList}`,
        },
      ],
    };
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('FeatBit MCP server running on stdio');
  }
}

// Start the server
const server = new FeatBitMCPServer();
server.run().catch(console.error);