# @turso/api

## Usage

```ts
import { createClient } from "@turso/api";

const turso = createClient({
  token: "...",
});

const organizations = await turso.organizations.list();

const orgMembers = await turso.organizations.members("slug");

const locations = await turso.locations.list();
```
