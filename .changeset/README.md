# Changesets

This directory is used by [Changesets](https://github.com/changesets/changesets) to manage versioning and changelogs.

## Adding a changeset

When you make changes that should be released, run:

```bash
pnpm changeset
```

This will prompt you to:
1. Select which packages are affected
2. Choose the bump type (patch, minor, major)
3. Write a summary of the changes

The changeset file will be committed with your PR.

## Release process

1. When PRs with changesets are merged to `main`, a "Version Packages" PR is automatically created/updated
2. Merging the "Version Packages" PR triggers the release workflow
3. Packages are published to npm, PyPI, and crates.io

## Package versioning

- `oxa-types`, `@oxa/core`, and `oxa` version independently
- Python and Rust `oxa-types` packages stay in sync with the TypeScript version
