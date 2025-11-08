#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
} from "@modelcontextprotocol/sdk/types.js";

/**
 * FeatBit MCP Server
 *
 * This MCP server provides tools to interact with FeatBit feature flag management API.
 * It supports creating, viewing, archiving, and restoring feature flags.
 */

interface FeatBitConfig {
  apiUrl: string;
  envId: string;
  organization: string;
  apiToken: string;
}

// Get configuration from environment variables
const config: FeatBitConfig = {
  apiUrl: process.env.FEATBIT_API_URL || "https://app-api.featbit.co",
  envId: process.env.FEATBIT_ENV_ID || "",
  organization: process.env.FEATBIT_ORGANIZATION || "",
  apiToken: process.env.FEATBIT_API_TOKEN || "",
};

// Validate configuration
function validateConfig(): void {
  const errors: string[] = [];

  if (!config.envId) {
    errors.push("FEATBIT_ENV_ID environment variable is required");
  }

  if (!config.apiToken) {
    errors.push("FEATBIT_API_TOKEN environment variable is required");
  }

  if (errors.length > 0) {
    console.error("Configuration errors:");
    errors.forEach(error => console.error(`  - ${error}`));
    process.exit(1);
  }
}

// Helper function to make API requests
async function makeFeatBitRequest(
  endpoint: string,
  method: string = "GET",
  body?: any
): Promise<any> {
  const url = `${config.apiUrl}${endpoint}`;
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "Authorization": config.apiToken.startsWith("api-")
      ? config.apiToken
      : `Bearer ${config.apiToken}`,
  };

  if (config.organization) {
    headers["Organization"] = config.organization;
  }

  const options: RequestInit = {
    method,
    headers,
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  const response = await fetch(url, options);

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`FeatBit API error (${response.status}): ${errorText}`);
  }

  return await response.json();
}

// Define tools
const TOOLS: Tool[] = [
  {
    name: "list_feature_flags",
    description: "List feature flags in the configured environment. Supports filtering by name, tags, enabled status, and archived status.",
    inputSchema: {
      type: "object",
      properties: {
        name: {
          type: "string",
          description: "Filter by name/key or part of the name/key of a feature flag",
        },
        tags: {
          type: "array",
          items: { type: "string" },
          description: "Filter by tags (must use complete tag names)",
        },
        isEnabled: {
          type: "boolean",
          description: "Filter by enabled status (true = only enabled, false = only disabled, omit = both)",
        },
        isArchived: {
          type: "boolean",
          description: "Filter by archived status (true = only archived, false = only active, default = false)",
        },
        pageIndex: {
          type: "number",
          description: "The index of the page to return (default: 0)",
        },
        pageSize: {
          type: "number",
          description: "The size of the page to return (default: 10)",
        },
      },
    },
  },
  {
    name: "get_feature_flag",
    description: "Get detailed information about a specific feature flag by its key.",
    inputSchema: {
      type: "object",
      properties: {
        key: {
          type: "string",
          description: "The unique key of the feature flag",
        },
      },
      required: ["key"],
    },
  },
  {
    name: "create_feature_flag",
    description: "Create a new feature flag with the specified configuration.",
    inputSchema: {
      type: "object",
      properties: {
        name: {
          type: "string",
          description: "The display name of the feature flag",
        },
        key: {
          type: "string",
          description: "The unique key for the feature flag (used in code)",
        },
        description: {
          type: "string",
          description: "Description of the feature flag",
        },
        variationType: {
          type: "string",
          description: "The type of variation values (e.g., 'boolean', 'string', 'number', 'json')",
          enum: ["boolean", "string", "number", "json"],
        },
        variations: {
          type: "array",
          description: "Array of variations for the flag",
          items: {
            type: "object",
            properties: {
              id: {
                type: "string",
                description: "Unique ID for the variation (use UUIDs)",
              },
              name: {
                type: "string",
                description: "Name of the variation",
              },
              value: {
                type: "string",
                description: "Value of the variation (as string)",
              },
            },
            required: ["id", "name", "value"],
          },
        },
        isEnabled: {
          type: "boolean",
          description: "Whether the flag is enabled (default: false)",
        },
        tags: {
          type: "array",
          items: { type: "string" },
          description: "Tags for categorizing the flag",
        },
      },
      required: ["name", "key", "variationType", "variations"],
    },
  },
  {
    name: "archive_feature_flag",
    description: "Archive a feature flag. Archived flags are hidden from the main list but can be restored.",
    inputSchema: {
      type: "object",
      properties: {
        key: {
          type: "string",
          description: "The unique key of the feature flag to archive",
        },
      },
      required: ["key"],
    },
  },
  {
    name: "restore_feature_flag",
    description: "Restore an archived feature flag to make it active again.",
    inputSchema: {
      type: "object",
      properties: {
        key: {
          type: "string",
          description: "The unique key of the feature flag to restore",
        },
      },
      required: ["key"],
    },
  },
];

// Tool handlers
async function handleListFeatureFlags(args: any): Promise<any> {
  const params = new URLSearchParams();

  if (args.name) params.append("Name", args.name);
  if (args.tags && Array.isArray(args.tags)) {
    args.tags.forEach((tag: string) => params.append("Tags", tag));
  }
  if (typeof args.isEnabled === "boolean") {
    params.append("IsEnabled", String(args.isEnabled));
  }
  if (typeof args.isArchived === "boolean") {
    params.append("IsArchived", String(args.isArchived));
  }
  if (args.pageIndex !== undefined) {
    params.append("PageIndex", String(args.pageIndex));
  }
  if (args.pageSize !== undefined) {
    params.append("PageSize", String(args.pageSize));
  }

  const queryString = params.toString();
  const endpoint = `/api/v1/envs/${config.envId}/feature-flags${
    queryString ? `?${queryString}` : ""
  }`;

  return await makeFeatBitRequest(endpoint);
}

async function handleGetFeatureFlag(args: any): Promise<any> {
  const { key } = args;
  const endpoint = `/api/v1/envs/${config.envId}/feature-flags/${encodeURIComponent(key)}`;
  return await makeFeatBitRequest(endpoint);
}

async function handleCreateFeatureFlag(args: any): Promise<any> {
  const endpoint = `/api/v1/envs/${config.envId}/feature-flags`;

  const body: any = {
    envId: config.envId,
    name: args.name,
    key: args.key,
    description: args.description || "",
    variationType: args.variationType,
    variations: args.variations,
    isEnabled: args.isEnabled || false,
    tags: args.tags || [],
  };

  // Set default enabled/disabled variations if not specified
  if (args.variations && args.variations.length > 0) {
    body.enabledVariationId = args.variations[0].id;
    body.disabledVariationId = args.variations[args.variations.length - 1].id;
  }

  return await makeFeatBitRequest(endpoint, "POST", body);
}

async function handleArchiveFeatureFlag(args: any): Promise<any> {
  const { key } = args;
  const endpoint = `/api/v1/envs/${config.envId}/feature-flags/${encodeURIComponent(key)}/archive`;
  return await makeFeatBitRequest(endpoint, "PUT");
}

async function handleRestoreFeatureFlag(args: any): Promise<any> {
  const { key } = args;
  const endpoint = `/api/v1/envs/${config.envId}/feature-flags/${encodeURIComponent(key)}/restore`;
  return await makeFeatBitRequest(endpoint, "PUT");
}

// Main server setup
const server = new Server(
  {
    name: "featbit-mcp-server",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Register handlers
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return { tools: TOOLS };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  try {
    const { name, arguments: args } = request.params;

    switch (name) {
      case "list_feature_flags":
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(await handleListFeatureFlags(args || {}), null, 2),
            },
          ],
        };

      case "get_feature_flag":
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(await handleGetFeatureFlag(args), null, 2),
            },
          ],
        };

      case "create_feature_flag":
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(await handleCreateFeatureFlag(args), null, 2),
            },
          ],
        };

      case "archive_feature_flag":
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(await handleArchiveFeatureFlag(args), null, 2),
            },
          ],
        };

      case "restore_feature_flag":
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(await handleRestoreFeatureFlag(args), null, 2),
            },
          ],
        };

      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return {
      content: [
        {
          type: "text",
          text: `Error: ${errorMessage}`,
        },
      ],
      isError: true,
    };
  }
});

// Start the server
async function main() {
  validateConfig();

  const transport = new StdioServerTransport();
  await server.connect(transport);

  console.error("FeatBit MCP Server running on stdio");
  console.error(`Environment ID: ${config.envId}`);
  console.error(`API URL: ${config.apiUrl}`);
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
