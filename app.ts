import { createClient } from "./dist";

const client = createClient({
  token: "",
});

client.databases
  .list()
  .then((res) => {
    console.log(res);
  })
  .catch(console.log);
