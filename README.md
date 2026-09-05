# Expo Build Cache — GitHub

Cache native Expo builds in GitHub Releases with `@slvssb/eas-github-cache`. Reuse a build with a matching project fingerprint to skip native compilation during local development.

The provider stores Android APKs and compressed iOS app bundles as prerelease assets in a repository you control. Downloaded builds are also cached locally.

> **Requirements:** Expo SDK 54–57 and Node.js 22.12 or later. This provider uses Expo's stable `buildCacheProvider` API. See [Expo's build cache documentation](https://docs.expo.dev/guides/cache-builds-remotely/).

## How it works

1. Expo CLI calculates the project's fingerprint and asks the provider for a matching build.
2. The provider checks its local cache, then looks for a GitHub Release tagged with the fingerprint and platform.
3. If a build is found, it downloads the release asset and extracts it when needed. Expo can then install the cached binary.
4. If no build is available, Expo compiles locally and calls the provider to upload the result to a GitHub prerelease.

This provider integrates with local `expo run:android` and `expo run:ios` commands. It does not cache builds triggered by `eas build`.

## Getting started

### 1. Prepare a GitHub repository

Choose a repository for cached builds. A dedicated private repository keeps build artifacts and cache releases separate from your application source.

Initialize the repository with a commit on `main`. The provider currently looks for `main`, with a fallback to `master`; it does not discover arbitrary default branch names.

Build assets in a public repository are public, so use a private repository for binaries you do not want to share publicly.

### 2. Set your GitHub token

Create a [GitHub personal access token](https://github.com/settings/tokens) with access to the cache repository and permission to create tags, releases, and release assets. For a classic token, the existing setup uses the `repo` scope.

Export it in the shell where you run Expo:

```bash
export GITHUB_TOKEN="your-github-token"
```

Keep the token out of your app configuration and source control. The provider reads it from `process.env.GITHUB_TOKEN` for uploads and downloads.

### 3. Install the package

From your Expo project:

```bash
bun expo install @slvssb/eas-github-cache --dev
```

### 4. Configure Expo

Merge this configuration into your `app.json`:

```json
{
  "expo": {
    "buildCacheProvider": {
      "plugin": "@slvssb/eas-github-cache",
      "options": {
        "owner": "your-github-user-or-organization",
        "repo": "your-build-cache-repository"
      }
    }
  }
}
```

### 5. Run your app

Run the command for your target platform:

```bash
bun expo run:android
```

```bash
bun expo run:ios
```

Your normal native development tools are still required for cache misses. Use iOS caching for Simulator builds; do not assume a cached device build is portable between devices.

## Configuration

| Setting | Where to set it | Description |
| --- | --- | --- |
| `owner` | Provider `options` | GitHub user or organization that owns the cache repository. Required. |
| `repo` | Provider `options` | Repository name, without the owner prefix. Required. |
| `GITHUB_TOKEN` | Environment variable | Token used to access the cache repository. Required for the documented setup. |

The cache repository can be different from the application repository. There are no custom cache-directory or retention options in this version.

## Cache storage and limitations

- **Remote storage:** Each fingerprint and platform maps to a prerelease. Android builds are uploaded as files; iOS app directories are archived as `.tar.gz` files. Downloads use the first asset in the release.
- **Local storage:** Downloaded builds live in a `build-run-cache` directory under the platform-specific temporary directory returned by `env-paths("github-build-cache-provider")`.
- **Build variants:** The current tag format is `fingerprint.<hash>.dev-client.<platform>`. The `.dev-client` suffix is included only when the project has a direct `expo-dev-client` dependency and the selected build is a development-client build. Other builds omit the suffix.
- **Retention:** The provider does not automatically expire local builds or GitHub releases. Manage old cache artifacts yourself. Removing a remote release does not invalidate a downloaded local copy.
- **Repeated uploads:** Existing assets are not replaced. An existing tag is also assumed to have a release. Duplicate uploads or a tag without a release can therefore fail.

## Troubleshooting

| Symptom | What to check |
| --- | --- |
| The provider never runs | Use Expo SDK 54–57 and put `buildCacheProvider` directly under `expo`, outside `experiments`. |
| `Build cache is disabled, skipping download` | The provider received a falsy `runOptions.buildCache` value. Check how your Expo CLI invokes it. |
| `No cached builds available for this fingerprint` | Check the token, repository, matching release, and its first asset. This message also covers authentication, download, and extraction errors. |
| `Release failed` | Check the logged error, token permissions, repository branch, and whether the tag or asset already exists. |

## Migrating from the legacy provider

Move the old `expo.experiments.remoteBuildCache.provider` object to `expo.buildCacheProvider`, keeping the same `plugin` and `options`. Upgrade the package alongside the configuration change. SDK 53 and the legacy plugin methods are no longer supported.

The cache-tag fix changes tags for builds that are not development-client builds. Those builds will create a new cache entry on their next run; existing GitHub releases are left in place.

## Development

Clone the repository and install the locked dependencies:

```bash
gh repo clone slvssb/eas-github-cache
cd eas-github-cache
bun install --frozen-lockfile
```

Build the package:

```bash
bun run build
```

Compiled JavaScript and TypeScript declarations are written to `build/`. Use `bun run watch` to rebuild while editing.

## Acknowledgements

Thank you to the [Expo team](https://expo.dev/) and contributors for building Expo CLI, project fingerprinting, and the extensible build cache provider API. Their work makes community providers like this possible.

Thanks also to [WookieFPV's build-cache-s3](https://github.com/WookieFPV/build-cache-s3) for the reference used to improve this README and for providing another community build cache option.

This is an independent community project, not an official Expo or GitHub product.
