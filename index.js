import express from "express";
import { config } from "dotenv";
import { ruruHTML } from "ruru/server";
import { createHandler } from "graphql-http/lib/use/express";
import { schema } from "./schema/schema.js";

config();

const port = process.env.PORT || 5000;
const app = express();

app.use(
  "/graphql",
  createHandler({
    schema,
  })
);

app.get("/", (_req, res) => {
  res.type("html");
  res.end(ruruHTML({ endpoint: "/graphql" }));
});

app.listen(port, () => console.log(`Server open on ${port} 🤘`));
