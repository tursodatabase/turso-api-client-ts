# @turso/api

## Usage

```ts
import { createClient } from "@turso/api";

const turso = createClient({
  org: "", // Your personal account or organization slug
  token: "...",
});
```

```ts
const organizations = await turso.organizations.list();
const orgMembers = await turso.organizations.members();
```

```ts
const locations = await turso.locations.list();
```

```ts
const groups = await turso.groups.list();
const group = await turso.groups.get("default");
const group = await turso.groups.create({
  name: "customgroup",
  location: "ams",
});
const group = await turso.groups.delete("customgroup");
const group = await turso.groups.addLocation("default", "lhr");
const group = await turso.groups.removeLocation("default", "lhr");
```

```ts
const tokens = await turso.apiTokens.list();
const token = await turso.apiTokens.create("superdupertokenname");
const token = await turso.apiTokens.revoke("superdupertokenname");
const token = await turso.apiTokens.validate("token");
```

```ts
const database = await turso.databases.list();

const database = await turso.databases.get("my-db");

const database = await turso.databases.create("db-name");
const database = await turso.databases.create("db-name", {
  image: "canary",
  group: "my-group",
});

const database = await turso.databases.update("my-db");

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

## Todo

- Maybe change to named args for all methods
