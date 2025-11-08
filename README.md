# FeatBit MCP Server

A Model Context Protocol (MCP) server that provides tools to interact with [FeatBit](https://www.featbit.co/) feature flag management API. This server enables AI assistants like Claude to manage feature flags programmatically.

## Features

This MCP server provides the following tools:

- **list_feature_flags**: List and filter feature flags in your environment
- **get_feature_flag**: Get detailed information about a specific feature flag
- **create_feature_flag**: Create new feature flags with custom variations
- **archive_feature_flag**: Archive feature flags
- **restore_feature_flag**: Restore archived feature flags

## Prerequisites

- Node.js 18 or higher
- A FeatBit account with API access
- FeatBit API credentials (API token and environment ID)

## Installation

### For Development

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

### From GitHub Packages

To install from GitHub Packages, first authenticate:

1. Create a personal access token (PAT) with `read:packages` scope at https://github.com/settings/tokens

2. Authenticate with GitHub Packages:
```bash
npm login --registry=https://npm.pkg.github.com --scope=@tidusjar
# Username: your-github-username
# Password: your-personal-access-token
# Email: your-email
```

3. Install the package:
```bash
npm install @tidusjar/featbit-mcp-server
```

### From GitHub Release (Recommended - No Authentication Required)

Download the latest `.tgz` file from the [Releases page](https://github.com/tidusjar/featbit-mcp/releases) and install it:

```bash
npm install -g /path/to/tidusjar-featbit-mcp-server-VERSION.tgz
```

## Configuration

The server requires the following environment variables:

| Variable | Required | Description | Default |
|----------|----------|-------------|---------|
| `FEATBIT_API_TOKEN` | Yes | Your FeatBit API token (format: `api-xxx` or Bearer token) | - |
| `FEATBIT_ENV_ID` | Yes | The environment ID (UUID format) | - |
| `FEATBIT_API_URL` | No | The FeatBit API base URL | `https://app-api.featbit.co` |
| `FEATBIT_ORGANIZATION` | No | Organization header (if required by your instance) | - |

### Getting Your Credentials

1. **API Token**:
   - Log in to your FeatBit instance
   - Navigate to your account settings or API settings
   - Generate a new API token with appropriate permissions
   - The token should start with `api-` (e.g., `api-MzQ...`)

2. **Environment ID**:
   - Go to your project settings in FeatBit
   - Select the environment you want to manage
   - Copy the environment ID (UUID format)

## Usage with Claude Desktop

After installing the package (see Installation section), add this server to your Claude Desktop configuration file:

### macOS
Edit `~/Library/Application Support/Claude/claude_desktop_config.json`:

**If installed globally from tarball:**
```json
{
  "mcpServers": {
    "featbit": {
      "command": "featbit-mcp-server",
      "env": {
        "FEATBIT_API_TOKEN": "api-your-token-here",
        "FEATBIT_ENV_ID": "your-env-id-here",
        "FEATBIT_API_URL": "https://app-api.featbit.co",
        "FEATBIT_ORGANIZATION": "your-org-name"
      }
    }
  }
}
```

**If running from development directory:**
```json
{
  "mcpServers": {
    "featbit": {
      "command": "node",
      "args": ["/path/to/featbit-mcp/build/index.js"],
      "env": {
        "FEATBIT_API_TOKEN": "api-your-token-here",
        "FEATBIT_ENV_ID": "your-env-id-here",
        "FEATBIT_API_URL": "https://app-api.featbit.co",
        "FEATBIT_ORGANIZATION": "your-org-name"
      }
    }
  }
}
```

### Windows
Edit `%APPDATA%\Claude\claude_desktop_config.json` with the same configuration.

### Linux
Edit `~/.config/Claude/claude_desktop_config.json` with the same configuration.

After updating the configuration, restart Claude Desktop.

## Tool Reference

### list_feature_flags

List feature flags with optional filtering.

**Parameters:**
- `name` (string, optional): Filter by name/key or part of the name/key
- `tags` (string[], optional): Filter by tags (must use complete tag names)
- `isEnabled` (boolean, optional): Filter by enabled status
- `isArchived` (boolean, optional): Filter by archived status (default: false)
- `pageIndex` (number, optional): Page index for pagination (default: 0)
- `pageSize` (number, optional): Page size for pagination (default: 10)

**Example:**
```
List all enabled feature flags
List feature flags with tag "authentication"
```

### get_feature_flag

Get detailed information about a specific feature flag.

**Parameters:**
- `key` (string, required): The unique key of the feature flag

**Example:**
```
Get details for feature flag "new-checkout-flow"
```

### create_feature_flag

Create a new feature flag.

**Parameters:**
- `name` (string, required): Display name of the feature flag
- `key` (string, required): Unique key for the feature flag (used in code)
- `description` (string, optional): Description of the feature flag
- `variationType` (string, required): Type of variation values: "boolean", "string", "number", or "json"
- `variations` (array, required): Array of variation objects with `id`, `name`, and `value`
- `isEnabled` (boolean, optional): Whether the flag is enabled (default: false)
- `tags` (string[], optional): Tags for categorizing the flag

**Example:**
```
Create a boolean feature flag called "dark-mode" with key "dark-mode-toggle"
```

**Variation Example:**
```json
{
  "variations": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440001",
      "name": "On",
      "value": "true"
    },
    {
      "id": "550e8400-e29b-41d4-a716-446655440002",
      "name": "Off",
      "value": "false"
    }
  ]
}
```

### archive_feature_flag

Archive a feature flag (hides it from the main list but doesn't delete it).

**Parameters:**
- `key` (string, required): The unique key of the feature flag to archive

**Example:**
```
Archive the feature flag "old-feature"
```

### restore_feature_flag

Restore an archived feature flag.

**Parameters:**
- `key` (string, required): The unique key of the feature flag to restore

**Example:**
```
Restore the feature flag "old-feature"
```

## Development

### Project Structure

```
featbit-mcp/
├── src/
│   └── index.ts          # Main server implementation
├── build/                # Compiled JavaScript (generated)
├── package.json          # Project dependencies
├── tsconfig.json         # TypeScript configuration
└── README.md            # This file
```

### Building

```bash
npm run build
```

### Watch Mode

For development, you can run TypeScript in watch mode:

```bash
npm run watch
```

## API Documentation

This server implements the FeatBit REST API v1. For more information about the API:

- [FeatBit API Documentation](https://docs.featbit.co/api-docs/using-featbit-rest-api)
- [OpenAPI Specification](https://app-api.featbit.co/swagger/OpenApi/swagger.json)

## Authentication

The server supports two authentication methods:

1. **API Key**: Set `FEATBIT_API_TOKEN` to your API key (format: `api-xxx`)
2. **Bearer Token**: Set `FEATBIT_API_TOKEN` to a JWT bearer token

The server will automatically detect the format and use the appropriate authentication method.

## Troubleshooting

### "Configuration errors" on startup

Make sure you have set the required environment variables:
- `FEATBIT_API_TOKEN`
- `FEATBIT_ENV_ID`

### "FeatBit API error (401)"

Check that your API token is valid and has the necessary permissions.

### "FeatBit API error (403)"

Verify that:
- Your API token has access to the specified environment
- The `FEATBIT_ORGANIZATION` header is set correctly (if required)

### "FeatBit API error (404)"

The requested feature flag or environment does not exist. Check:
- The environment ID is correct
- The feature flag key is spelled correctly

## Releases

This project uses automated GitHub Actions workflows for releases:

- **Pre-releases**: Automatically created when code is pushed to `claude/**` branches
- **Stable releases**: Created by pushing version tags (e.g., `git tag v1.0.0 && git push origin v1.0.0`)

Releases are published to GitHub Packages and include downloadable `.tgz` files on the [Releases page](https://github.com/tidusjar/featbit-mcp/releases).

See [.github/RELEASE.md](.github/RELEASE.md) for detailed release process documentation.

### Installation from Releases

**From GitHub Packages (requires authentication):**
```bash
# Authenticate first (see Installation section above)
npm install @tidusjar/featbit-mcp-server

# Or for pre-release:
npm install @tidusjar/featbit-mcp-server@pre-release
```

**From GitHub Release tarball (recommended, no authentication):**

Download the `.tgz` file from the [Releases page](https://github.com/tidusjar/featbit-mcp/releases) and install:
```bash
npm install -g /path/to/downloaded/tidusjar-featbit-mcp-server-VERSION.tgz
```

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

For information about the release process, see [.github/RELEASE.md](.github/RELEASE.md).

## Support

For issues related to:
- **This MCP server**: Open an issue in this repository
- **FeatBit API**: Check the [FeatBit documentation](https://docs.featbit.co/) or [GitHub](https://github.com/featbit/featbit)
- **MCP Protocol**: Check the [Model Context Protocol documentation](https://modelcontextprotocol.io/)
