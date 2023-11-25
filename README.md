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

const groups = await turso.groups.list();
const group = await turso.groups.get("default");
const group = await turso.groups.get("default", "my-company"); // org
const group = await turso.groups.create({
  name: "customgroup",
  location: "ams",
});
const group = await turso.groups.create(
  {
    name: "customgroup",
    location: "ams",
  },
  "my-company"
); // org
const group = await turso.groups.delete("customgroup");
const group = await turso.groups.create("customgroup", "my-company"); // org
const group = await turso.groups.addLocation("default", "lhr");
const group = await turso.groups.addLocation(
  "customgroup",
  "lhr",
  "my-company"
); // org
const group = await turso.groups.removeLocation("default", "lhr");
const group = await turso.groups.removeLocation(
  "customgroup",
  "lhr",
  "my-company"
); // org
```
