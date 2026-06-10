# Modular OpenAPI Structure

The TEQ Public API specification has been split into a modular structure for better maintainability and organization.

## Directory Structure

```
TEQ_Public_API_1.0_modular.yaml          # Main entry point
├── paths/                                # API path definitions grouped by tag
│   ├── operations-trips.yaml            # Operations/Trips endpoints
│   ├── sales-customers.yaml             # Sales/Customers endpoints
│   ├── sales-requests.yaml              # Sales/Requests endpoints
│   ├── sales-orders.yaml                # Sales/Orders endpoints
│   ├── sales-capacity.yaml              # Sales/Capacity endpoints
│   ├── core-products.yaml               # Core/Products endpoints
│   ├── core-vehicles.yaml               # Core/Vehicles endpoints
│   └── core-employees.yaml              # Core/Employees endpoints
└── components/
    ├── parameters/                       # Reusable parameters
    │   ├── domain.yaml
    │   └── timezone.yaml
    ├── responses/                        # Reusable responses
    │   ├── 400.yaml
    │   └── 404.yaml
    └── schemas/                          # Data models
        ├── Customer.yaml
        ├── Trip.yaml
        ├── Order.yaml
        └── ... (all other schemas)
```

## Usage

### Main File
The main file `TEQ_Public_API_1.0_modular.yaml` contains:
- API metadata (info, description, authentication details)
- References to all paths and components

### Path Files
Each path file is organized by the API tag (e.g., Operations/Trips, Sales/Customers) and contains all endpoints for that category.

### Component Files
- **Parameters**: Reusable parameters like `domain` and `timezone` headers
- **Responses**: Common HTTP responses (400, 404)
- **Schemas**: All data models used in requests and responses

## Building/Bundling

To generate a single-file version for deployment or documentation:

```bash
# Using Redocly CLI
npx @redocly/cli bundle TEQ_Public_API_1.0_modular.yaml -o TEQ_Public_API_1.0_bundled.yaml

# Or if installed globally
redocly bundle TEQ_Public_API_1.0_modular.yaml -o TEQ_Public_API_1.0_bundled.yaml
```

## GitHub Actions Integration

The GitHub Actions workflow can be updated to use the modular structure:

```yaml
- name: Generate documentation
  run: redocly build-docs TEQ_Public_API_1.0_modular.yaml --template custom.hbs -o index.html

- name: Convert to JSON
  run: redocly bundle TEQ_Public_API_1.0_modular.yaml -o openapi.json
```

Redocly CLI automatically resolves all `$ref` references when bundling or generating documentation.

## Benefits

1. **Better Organization**: Each API category (tag) has its own file
2. **Easier Maintenance**: Changes to specific endpoints are isolated to their respective files
3. **Reusability**: Common components (parameters, responses, schemas) are defined once
4. **Team Collaboration**: Multiple team members can work on different files simultaneously
5. **Version Control**: Git diffs are cleaner and more meaningful

## Migration

The original monolithic file `TEQ_Public_API_1.0.yaml` remains unchanged. The modular version is in `TEQ_Public_API_1.0_modular.yaml`.

To switch to the modular version:
1. Update GitHub Actions to reference `TEQ_Public_API_1.0_modular.yaml`
2. Test the bundle and documentation generation
3. Once verified, you can optionally rename or archive the original file
