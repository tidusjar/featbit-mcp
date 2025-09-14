# FeatBit MCP Server

A Node.js & TypeScript based MCP (Model Context Protocol) server that provides LLMs with access to the FeatBit API for feature flag management and evaluation.

## Features

The FeatBit MCP server provides the following tools for LLMs:

- **configure_featbit**: Set up connection to your FeatBit instance
- **list_feature_flags**: List all feature flags in an environment
- **get_feature_flag**: Get detailed information about a specific feature flag
- **evaluate_feature_flag**: Evaluate a feature flag for a specific user
- **evaluate_multiple_flags**: Evaluate multiple feature flags for a user at once
- **get_all_flag_values**: Get all feature flag values for a specific user

## Installation

1. Clone this repository:
```bash
git clone https://github.com/tidusjar/featbit-mcp.git
cd featbit-mcp
```

2. Install dependencies:
```bash
npm install
```

3. Build the project:
```bash
npm run build
```

## Usage

### Running the Server

The MCP server runs on stdio and can be used with any MCP-compatible client:

```bash
npm start
```

For development with auto-rebuild:
```bash
npm run dev
```

### Configuration

Before using any feature flag operations, you must configure the connection to your FeatBit instance using the `configure_featbit` tool:

```json
{
  "name": "configure_featbit",
  "arguments": {
    "serverUrl": "https://your-featbit-instance.com",
    "apiKey": "your-api-key",
    "envKey": "your-environment-key"
  }
}
```

### Available Tools

#### 1. configure_featbit
Configure connection settings for FeatBit.

**Parameters:**
- `serverUrl` (string): Your FeatBit server URL (e.g., "https://app.featbit.co")
- `apiKey` (string): Your FeatBit API key for authentication
- `envKey` (string): Environment key (e.g., "prod", "dev", "staging")

#### 2. list_feature_flags
List all feature flags in the configured environment.

**Parameters:** None

#### 3. get_feature_flag
Get detailed information about a specific feature flag.

**Parameters:**
- `flagKey` (string): The key of the feature flag to retrieve

#### 4. evaluate_feature_flag
Evaluate a feature flag for a specific user context.

**Parameters:**
- `flagKey` (string): The key of the feature flag to evaluate
- `user` (object):
  - `keyId` (string): Unique identifier for the user
  - `name` (string, optional): Display name for the user
  - `customizedProperties` (object, optional): Custom properties for targeting

#### 5. evaluate_multiple_flags
Evaluate multiple feature flags for a user at once.

**Parameters:**
- `flagKeys` (array): Array of feature flag keys to evaluate
- `user` (object): User context (same as above)

#### 6. get_all_flag_values
Get all feature flag values for a specific user.

**Parameters:**
- `user` (object): User context (same as above)

## Example Usage

Here's an example sequence of tool calls:

1. **Configure FeatBit:**
```json
{
  "name": "configure_featbit",
  "arguments": {
    "serverUrl": "https://app.featbit.co",
    "apiKey": "your-api-key-here",
    "envKey": "production"
  }
}
```

2. **List all feature flags:**
```json
{
  "name": "list_feature_flags",
  "arguments": {}
}
```

3. **Evaluate a feature flag for a user:**
```json
{
  "name": "evaluate_feature_flag",
  "arguments": {
    "flagKey": "new-checkout-flow",
    "user": {
      "keyId": "user-123",
      "name": "John Doe",
      "customizedProperties": {
        "tier": "premium",
        "country": "US"
      }
    }
  }
}
```

## FeatBit API Integration

This MCP server integrates with the FeatBit REST API following the official documentation:
- [Using FeatBit REST API](https://docs.featbit.co/api-docs/using-featbit-rest-api)
- [Retrieve Feature Flags with API](https://docs.featbit.co/sdk/retrieve-feature-flags-with-api)

The server supports standard FeatBit API endpoints for:
- Feature flag listing and retrieval
- Feature flag evaluation with user context
- Bulk evaluation operations

## Development

### Scripts

- `npm run build`: Build the TypeScript project
- `npm run dev`: Run in development mode with auto-reload
- `npm start`: Run the built server
- `npm run watch`: Watch for TypeScript changes
- `npm run clean`: Clean build artifacts

### Project Structure

```
src/
├── index.ts          # Main MCP server implementation
├── featbit-client.ts # FeatBit API client
└── types.ts          # TypeScript type definitions
```

## Error Handling

The server includes comprehensive error handling for:
- Network connectivity issues
- API authentication failures
- Invalid parameters
- Missing configuration

All errors are returned as structured responses with descriptive messages.

## License

MIT License - see LICENSE file for details.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
