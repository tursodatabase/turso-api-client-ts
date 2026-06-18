<p align="center">
  <h1 align="center">@tursodatabase/api</h1>
</p>

<p align="center">
  Programmatically manage Turso Cloud databases.
</p>

<p align="center">
  <a title="JavaScript" target="_blank" href="https://www.npmjs.com/package/@tursodatabase/api"><img alt="NPM" src="https://img.shields.io/npm/v/@tursodatabase/api"></a>
  <a title="MIT" target="_blank" href="https://github.com/tursodatabase/turso-api-client-ts/blob/main/LICENSE.md"><img src="http://img.shields.io/badge/license-MIT-orange.svg?style=flat-square"></a>
</p>
<p align="center">
  <a title="Users's Discord" target="_blank" href="https://tur.so/discord"><img alt="Chat with other users of Turso (and Turso Cloud) on Discord" src="https://img.shields.io/discord/933071162680958986?label=Discord&logo=Discord&style=social&label=Users"></a>
</p>

---

## Install

```
npm install @tursodatabase/api
```

## Usage

```ts
import { createClient } from "@tursodatabase/api";

const turso = createClient({
  org: "", // Your personal account or organization slug
  token: "...",
});
```

You can also identify your organization by id instead of slug. Provide either
`org` or `orgId` (`orgId` takes precedence when both are set). `orgId` requires
v3 of the Turso API:

```ts
const turso = createClient({
  orgId: "...", // Your organization id, instead of the slug
  token: "...",
});
```

`token` accepts either a static string or a function that resolves one on
demand. The function is awaited on every request, which is handy for
short-lived tokens that need to be refreshed:

```ts
const turso = createClient({
  org: "",
  token: async () => await getFreshToken(),
});
```

```ts
const organizations = await turso.organizations.list();
const orgMembers = await turso.organizations.update({ overages: true });
const orgMembers = await turso.organizations.delete();
const orgMembers = await turso.organizations.members();
const orgMembers = await turso.organizations.addMember("username", "admin");
const orgMembers = await turso.organizations.removeMember("username");
const invite = await turso.organizations.inviteUser(
  "jamie@turso.tech",
  "admin"
);
await turso.organizations.deleteInvite("jamie@turso.tech");
const invoices = await turso.organizations.invoices();
```

```ts
const locations = await turso.locations.list();
const closest = await turso.locations.closest();
```

```ts
const groups = await turso.groups.list();
const group = await turso.groups.get("default");
const group = await turso.groups.create("customgroup", "lhr");
const group = await turso.groups.delete("customgroup");
const token = await turso.groups.createToken("default");
const token = await turso.groups.createToken("default", {
  expiration: "1w2d6h3m",
  authorization: "full-access",
});
const token = await turso.groups.createToken("default", {
  permissions: {
    read_attach: {
      databases: ["db1", "db2"],
    },
  },
});
const token = await turso.groups.rotateTokens("default");
```

```ts
const tokens = await turso.apiTokens.list();
const token = await turso.apiTokens.create("superdupertokenname");
const token = await turso.apiTokens.revoke("superdupertokenname");
const token = await turso.apiTokens.validate("token");
```

Methods that operate on a single database (`get`, `delete`, `createToken`,
`rotateTokens`, `usage`, `listInstances`, `getInstance`, `updateVersion`) take a
database identifier. On v1/v2 of the Turso API this is the database name; on v3
it is the database id.

```ts
const database = await turso.databases.list();
const database = await turso.databases.list({
  group: "group-name", // Filter by group
});

const database = await turso.databases.get("my-db");

const database = await turso.databases.create("db-name");
const database = await turso.databases.create("db-name", {
  group: "my-group",
});
// Identify the group by id instead of name (mutually exclusive with `group`).
// Requires v3 of the Turso API.
const database = await turso.databases.create("db-name", {
  groupId: "my-group-id",
});
const database = await turso.databases.create("db-name", {
  group: "my-group",
  seed: {
    type: "database",
    name: "my-existing-db",
  },
});
const database = await turso.databases.create("db-name", {
  group: "my-group",
  seed: {
    type: "database",
    name: "my-existing-db",
    timestamp: "2021-01-01T00:00:00Z", // or new Date("2021-01-01T00:00:00Z")
  },
});
const database = await turso.databases.create("parent-db", {
  is_schema: true,
});
const database = await turso.databases.create("child-db", {
  schema: "parent-db",
});
const database = await turso.databases.create("encrypted-db", {
  group: "my-group",
  remote_encryption: {
    encryption_key: "<base64-encoded-key>",
    encryption_cipher: "aes256gcm",
  },
});

const database = await turso.databases.delete("my-db");

const token = await turso.databases.createToken("my-db");
const token = await turso.databases.createToken("my-db", {
  expiration: "1w2d6h3n",
  authorization: "full-access",
});
const token = await turso.databases.rotateTokens("my-db");

const usageStatsWithDate = await turso.databases.usage("my-db");
const usageStatsWithDate = await turso.databases.usage("my-db", {
  from: new Date("2023-01-01"),
  to: new Date("2023-02-01"),
});
// Using ISOStrings
const usageStatsWithString = await turso.databases.usage("my-db", {
  from: "2023-01-01T00:00:00Z",
  to: "2023-02-01T00:00:00Z",
});
```

## License

MIT
