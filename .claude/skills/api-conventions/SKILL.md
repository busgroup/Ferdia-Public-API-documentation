---
name: api-conventions
description: >
  Guide for authoring and extending the TEQ / Ferdia Public API OpenAPI spec.
  Use this skill whenever the user wants to add a new endpoint, add a new schema,
  rename or reorganise a path, check whether something follows project conventions,
  or ask how something should be structured in this repo. Also trigger for questions
  like "how do I add a new route", "where does this schema go", "what tag should I use",
  or "is this the right way to write a path file".
---

## Overview

The spec is **modular**: one root file wires everything together via `$ref`, while
paths and schemas each live in their own files. The CI pipeline bundles everything
into a single artifact; never edit the bundled output files directly.

```
TEQ_Public_API_1.0_modular.yaml   ← root / entry point (edit this to register new paths & schemas)
paths/                             ← one file per API group
components/
  schemas/                         ← one file per schema object
  parameters/                      ← reusable header params
  responses/                       ← reusable error responses
```

---

## Adding a new endpoint

### 1. Choose (or create) the right paths file

Path files are named `<group>-<resource>.yaml` and map to one API tag:

| File | Tag |
|---|---|
| `paths/operations-trips.yaml` | `Operations/Trips` |
| `paths/sales-customers.yaml` | `Sales/Customers` |
| `paths/sales-requests.yaml` | `Sales/Requests` |
| `paths/sales-orders.yaml` | `Sales/Orders` |
| `paths/sales-capacity.yaml` | `Sales/Capacity` |
| `paths/core-vehicles.yaml` | `Core/Vehicles` |
| `paths/core-employees.yaml` | `Core/Employees` |

If the endpoint belongs to a new group, create a new file following the same naming pattern and add its tag to the table above.

### 2. Write the path entry

Every operation must include:

- `tags` — exactly one tag from the table above (format: `Group/Resource`)
- `summary` and `description`
- `parameters` — always include the `domain` header ref **first**, then any path/query params
- `responses` — always include at minimum `"400"` (and `"404"` for endpoints that fetch by ID)

**Template for a GET-by-ID endpoint:**

```yaml
/group/resource/{id}:
  get:
    summary: Returns a single <resource>
    description: Returns a single <resource>
    tags:
      - Group/Resource
    parameters:
      - $ref: "../components/parameters/domain.yaml"
      - name: id
        in: path
        description: <Resource> Id
        required: true
        schema:
          type: integer
        example: 42
    responses:
      "200":
        description: Successfully returned a <resource>
        content:
          application/json:
            schema:
              $ref: "../components/schemas/<Resource>.yaml"
      "400":
        $ref: "../components/responses/400.yaml"
      "404":
        $ref: "../components/responses/404.yaml"
```

**Template for a GET-list endpoint:**

```yaml
/group/resource:
  get:
    summary: Returns a list of <resource>
    description: Returns a list of <resource> based on the filters provided
    tags:
      - Group/Resource
    parameters:
      - $ref: "../components/parameters/domain.yaml"
      # add query params here
    responses:
      "200":
        description: Successfully returned a list of <resource>
        content:
          application/json:
            schema:
              type: array
              items:
                $ref: "../components/schemas/<Resource>.yaml"
      "400":
        $ref: "../components/responses/400.yaml"
```

**Template for a POST endpoint:**

```yaml
/group/resource:
  post:
    summary: Creates a new <resource>
    description: Creates a new <resource>
    tags:
      - Group/Resource
    parameters:
      - $ref: "../components/parameters/domain.yaml"
    requestBody:
      description: <Resource> data
      required: true
      content:
        application/json:
          schema:
            $ref: "../components/schemas/Post<Resource>.yaml"
    responses:
      "201":
        description: Successfully created <resource>
        content:
          application/json:
            schema:
              type: object
              properties:
                <resource>Id:
                  type: string
      "400":
        $ref: "../components/responses/400.yaml"
```

### 3. Register the path in the root file

In `TEQ_Public_API_1.0_modular.yaml`, add the path under the correct comment group.
The `$ref` value encodes the path with `~1` substituting `/`:

```yaml
# Group/Resource
/group/resource:
  $ref: './paths/group-resource.yaml#/~1group~1resource'
/group/resource/{id}:
  $ref: './paths/group-resource.yaml#/~1group~1resource~1{id}'
```

---

## Adding a new schema

1. Create `components/schemas/<SchemaName>.yaml` — no `type: object` wrapper needed at the top level; start directly with `properties:`.
2. Use `$ref: "./<OtherSchema>.yaml"` for nested schema references (relative, no `../`).
3. Register it in `TEQ_Public_API_1.0_modular.yaml` under `components.schemas`, grouped by domain:

```yaml
components:
  schemas:
    # Group related schemas
    MySchema:
      $ref: './components/schemas/MySchema.yaml'
```

**Naming conventions:**
- Read/response schema: `<Resource>.yaml` (e.g. `Customer.yaml`)
- POST body schema: `Post<Resource>.yaml` (e.g. `PostCustomer.yaml`)
- PUT body schema: `Put<Resource>.yaml` (e.g. `PutCustomer.yaml`)
- List entry (when different from full object): `<Resource>ListEntry.yaml`

---

## Required headers

Every endpoint **must** include `domain` as the first parameter:

```yaml
parameters:
  - $ref: "../components/parameters/domain.yaml"
```

`TimeZone` is required by the platform but is documented at the API level (in the root description), not repeated on individual operations — do not add it per-endpoint.

---

## Authentication

The API uses **OAuth 2.0 Client Credentials** flow. Token endpoint: `https://auth.api.ferdia.app/oauth2/token`. This is documented in the root file description; do not duplicate auth details in individual path files.

---

## $ref path rules

| From | To schemas | To parameters | To responses |
|---|---|---|---|
| `paths/*.yaml` | `../components/schemas/X.yaml` | `../components/parameters/X.yaml` | `../components/responses/X.yaml` |
| `components/schemas/*.yaml` | `./OtherSchema.yaml` | — | — |
| Root `TEQ_Public_API_1.0_modular.yaml` | `./components/schemas/X.yaml` | `./components/parameters/X.yaml` | `./components/responses/X.yaml` |

---

## Checklist before committing

- [ ] New path file created (if new group) and named `<group>-<resource>.yaml`
- [ ] Tag matches exactly one entry from the tag table
- [ ] `domain` header `$ref` is the first parameter on every operation
- [ ] All response schemas `$ref` existing schema files
- [ ] `400` response present on all operations; `404` present on by-ID operations
- [ ] New path registered in root file under the correct comment group
- [ ] New schemas registered in `components.schemas` in root file
- [ ] No edits to `TEQ_Public_API.yaml`, `index.html`, or `openapi.json` (generated files)
