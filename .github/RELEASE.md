# Release Process

This document describes the automated release process for the FeatBit MCP Server.

## Overview

The project uses GitHub Actions to automate the release process. There are two types of releases:

1. **Pre-releases** - Automatic builds from feature branches
2. **Stable releases** - Manual releases via tags or workflow dispatch

## Pre-release Workflow

Pre-releases are automatically created when:
- Code is pushed to branches matching `claude/**`
- Tags matching pre-release patterns are pushed (`v*-pre*`, `v*-alpha*`, `v*-beta*`, `v*-rc*`)
- Manually triggered via workflow dispatch

### Automatic Pre-releases from Branches

When you push code to a `claude/**` branch, the workflow will:

1. Build the TypeScript code
2. Generate a version number like `1.0.0-pre.20231208120000.abc1234`
3. Create a GitHub pre-release with the built package
4. Attach the `.tgz` package file to the release

**Example:**
```bash
git checkout -b claude/new-feature
# Make changes
git commit -m "Add new feature"
git push origin claude/new-feature
# Pre-release is automatically created!
```

### Manual Pre-release

You can manually trigger a pre-release via GitHub Actions:

1. Go to Actions → Pre-release workflow
2. Click "Run workflow"
3. Enter a version number (e.g., `1.0.0-alpha.1`)
4. Click "Run workflow"

## Stable Release Workflow

Stable releases are created when:
- A tag matching `v[0-9]+.[0-9]+.[0-9]+` is pushed (e.g., `v1.0.0`)
- Manually triggered via workflow dispatch

### Release via Git Tag

```bash
# Make sure your changes are committed
git tag v1.0.0
git push origin v1.0.0
# Stable release is automatically created!
```

### Manual Release

1. Go to Actions → Release workflow
2. Click "Run workflow"
3. Enter the version number (e.g., `1.0.0`)
4. Click "Run workflow"

## Publishing to npm

Both workflows support publishing to npm, but it requires configuration:

### Setup npm Publishing

1. Create an npm account and get an API token:
   - Go to https://www.npmjs.com/
   - Create an account (if needed)
   - Go to Account Settings → Access Tokens
   - Generate a new "Automation" token

2. Add the token to GitHub Secrets:
   - Go to your repository → Settings → Secrets and variables → Actions
   - Click "New repository secret"
   - Name: `NPM_TOKEN`
   - Value: Your npm token
   - Click "Add secret"

3. Next time a release runs, it will automatically publish to npm!

### npm Publishing Behavior

- **Pre-releases**: Published with the `pre-release` tag
  ```bash
  npm install featbit-mcp-server@pre-release
  ```

- **Stable releases**: Published with the `latest` tag (default)
  ```bash
  npm install featbit-mcp-server
  ```

If `NPM_TOKEN` is not configured, the workflows will skip npm publishing but still create GitHub releases.

## Version Numbering

### Pre-release Versions

Automatically generated pre-release versions follow this format:
```
<base-version>-pre.<timestamp>.<short-sha>
```

Example: `1.0.0-pre.20231208120000.abc1234`

### Stable Versions

Use semantic versioning (SemVer):
- **Major**: `v2.0.0` - Breaking changes
- **Minor**: `v1.1.0` - New features, backward compatible
- **Patch**: `v1.0.1` - Bug fixes, backward compatible

## Installation from Releases

### From npm

```bash
# Latest stable version
npm install featbit-mcp-server

# Specific version
npm install featbit-mcp-server@1.0.0

# Latest pre-release
npm install featbit-mcp-server@pre-release
```

### From GitHub Release

1. Go to the [Releases page](https://github.com/tidusjar/featbit-mcp/releases)
2. Download the `.tgz` file from the desired release
3. Install it:
   ```bash
   npm install /path/to/featbit-mcp-server-1.0.0.tgz
   ```

### Using npx (Recommended for Claude Desktop)

No installation needed! Use `npx` to run the latest version:

```json
{
  "mcpServers": {
    "featbit": {
      "command": "npx",
      "args": ["-y", "featbit-mcp-server"],
      "env": {
        "FEATBIT_API_TOKEN": "your-api-token",
        "FEATBIT_ENV_ID": "your-env-id"
      }
    }
  }
}
```

## Troubleshooting

### Pre-release not created

- Check that your branch name matches `claude/**`
- Verify the workflow has permissions to create releases
- Check the Actions tab for error messages

### npm publish failed

- Verify `NPM_TOKEN` is set in repository secrets
- Check that the package name is available on npm
- Ensure you have permission to publish the package

### Version conflicts

If a version already exists:
- For tags: Use a different version number
- For branches: The workflow automatically generates unique versions

## Best Practices

1. **Use pre-releases for testing**: Push to `claude/**` branches to create pre-releases
2. **Test before stable release**: Install and test pre-release versions before creating stable releases
3. **Follow SemVer**: Use semantic versioning for stable releases
4. **Write release notes**: GitHub auto-generates release notes, but you can edit them afterward
5. **Tag from main**: Create stable release tags from the main/master branch

## Questions?

If you have questions about the release process, please open an issue on GitHub.
