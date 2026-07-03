# openproject-sdk

Node.js SDK for the [OpenProject API v3](https://www.openproject.org/docs/api/introduction/).

## Installation

```bash
npm install openproject-sdk
```

Requires Node.js 18+ (uses native `fetch`).

## Quick start

Generate an API key in OpenProject under **My account → Access tokens**.

```typescript
import { OpenProjectClient } from "openproject-sdk";

const client = new OpenProjectClient({
  baseUrl: "https://openproject.example.com",
  apiKey: process.env.OPENPROJECT_API_KEY!,
});

// Current user
const me = await client.users.me();

// List projects
const projects = await client.projects.list({ pageSize: 20 });

// Create a work package
const wp = await client.workPackages.create({
  project: 1,
  type: 1,
  subject: "Implement login page",
  description: "Add OAuth support",
  assignee: me.id,
});

// Filter work packages
const openTasks = await client.workPackages.list({
  filters: [
    { project: { operator: "=", values: ["1"] } },
    { status: { operator: "o", values: [] } },
  ],
});

// Paginate through all results
for await (const project of client.projects.iterate()) {
  console.log(project.name);
}
```

## Authentication

By default the SDK sends your API key as a Bearer token:

```typescript
new OpenProjectClient({ baseUrl, apiKey, auth: "bearer" }); // default
```

You can also use Basic auth (`apikey` / API key):

```typescript
new OpenProjectClient({ baseUrl, apiKey, auth: "basic" });
```

## Resources

| Resource | Methods |
|----------|---------|
| `projects` | `list`, `listAll`, `iterate`, `get`, `create`, `update`, `delete` |
| `workPackages` | `list`, `listAll`, `iterate`, `get`, `create`, `update`, `delete`, `listForProject` |
| `users` | `list`, `listAll`, `iterate`, `get`, `me` |
| `timeEntries` | `list`, `listAll`, `iterate`, `get`, `create`, `update`, `delete` |
| `statuses`, `types`, `priorities` | `list`, `get` |

For endpoints not yet wrapped, use the low-level methods on the client:

```typescript
await client.get("/api/v3/versions");
await client.post("/api/v3/versions", { name: "v1.0", _links: { definingProject: { href: "/api/v3/projects/1" } } });
```

## Error handling

Failed API responses throw `OpenProjectError` with `status`, `message`, and the parsed error body:

```typescript
import { OpenProjectError } from "openproject-sdk";

try {
  await client.workPackages.get(999);
} catch (err) {
  if (err instanceof OpenProjectError) {
    console.error(err.status, err.errorIdentifier, err.message);
  }
}
```

## Development

```bash
npm install
npm run build
npm test
```

## License

MIT
