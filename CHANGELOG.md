# Changelog

## 2.0.0

### Breaking changes

- Require Expo SDK 54–57 and Node.js 22.12.0 or later.
- Use `expo.buildCacheProvider` instead of `expo.experiments.remoteBuildCache.provider` in app configuration.
- Export `resolveBuildCache` and `uploadBuildCache` instead of the legacy remote-cache methods.
- Use the consuming project's `@expo/config` through a peer dependency.

### Fixes and maintenance

- Add `.dev-client` to cache tags only for development-client builds. Other builds create new cache entries; existing releases are not deleted.
- Declare `fast-glob` directly and remove unused dependencies.
- Upgrade runtime dependencies, including `tar` to 7.5.22 and `@octokit/rest` to 22.0.1.
- Update TypeScript tooling, make type checking emit no files, and remove scripts referencing a missing configuration.
- Expand the README with setup, migration, limitations, troubleshooting, and acknowledgements to the Expo team.

See the README's migration section before upgrading from 1.0.0.
