# Contributing to OXA

## Prerequisites

- [Node.js](https://nodejs.org/) (v20+)
- [pnpm](https://pnpm.io/) (v9+)
- [uv](https://docs.astral.sh/uv/) (for Python package management)

## Setup

```bash
# Install dependencies
pnpm install
```

## Development Scripts

### Formatting

```bash
# Format all files
pnpm format

# Check formatting without modifying files
pnpm format:check
```

### Linting

```bash
# Check for lint issues
pnpm lint

# Auto-fix lint issues
pnpm lint:fix
```

### Type Checking

```bash
# Run TypeScript type checking
pnpm typecheck
```

### Code Generation

```bash
# Run all code generation (validate, ts, py, rs, docs)
pnpm codegen all

# Or run individual steps:
pnpm codegen validate  # Validate schema files
pnpm codegen ts        # Generate TypeScript types
pnpm codegen py        # Generate Python Pydantic models
pnpm codegen rs        # Generate Rust types
pnpm codegen docs      # Generate MyST documentation
```

### Building

```bash
# Build all packages
pnpm build
```
