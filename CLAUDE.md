# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this repo is

OpenAPI documentation for the Ferdia/TEQ Public API, rendered with Redocly and deployed to GitHub Pages. The source is a modular OpenAPI 3.x spec split across multiple YAML files; the CI pipeline bundles them into a single `TEQ_Public_API.yaml` and generates `index.html`.

## Build

The pipeline uses `pnpm` and `@redocly/cli`. To replicate locally:

```sh
pnpm install
# Bundle modular spec into a single file
npx redocly bundle TEQ_Public_API_1.0_modular.yaml -o TEQ_Public_API.yaml
# Build HTML docs
npx redocly build-docs TEQ_Public_API.yaml --template custom.hbs -o index.html
# Export JSON
npx redocly bundle TEQ_Public_API.yaml -o openapi.json
```

Deployment happens automatically via `.github/workflows/pipeline.yml` on every push to `main` (GitHub Pages).

## Modular structure

The main entry point is `TEQ_Public_API_1.0_modular.yaml`. It `$ref`s:

- **`paths/`** — one file per API group (e.g. `operations-trips.yaml`, `sales-customers.yaml`)
- **`components/schemas/`** — individual schema files (Customer, Trip, Order, Vehicle, Employee, etc.)
- **`components/parameters/`** — shared header params (`domain.yaml`, `timezone.yaml`)
- **`components/responses/`** — shared error responses (`400.yaml`, `404.yaml`)

`TEQ_Public_API_1.0 DEV.yaml` is the legacy monolithic spec — kept for reference but not part of the build.

`MODULAR_STRUCTURE.md` has a detailed breakdown of which schemas belong to which path group.

## Key API conventions

- **Auth**: OAuth 2.0 Client Credentials flow.
- **Required headers on every request**: `domain` (tenant identifier) and `TimeZone`.
- API tags follow `Operations/`, `Sales/`, and `Core/` prefixes.
