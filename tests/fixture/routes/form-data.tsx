/** @jsx h */
/** @jsxFrag Fragment */
import { Fragment, h } from "preact";
import { error, validateFormData, z } from "fresh-validation";
import testShape from "@/shapes/test.ts";
import { Handlers } from "$fresh/server.ts";

globalThis.errors = null;

export const handler: Handlers = {
  GET: (req, ctx) => {
    const errors = globalThis.errors;
    globalThis.errors = null;
    return ctx.render({ errors });
  },

  async POST(req) {
    const { validatedData, errors } = await validateFormData(req, testShape);

    if (errors) {
      globalThis.errors = errors;
      return new Response(null, {
        status: 303,
        headers: { Location: req.headers.get("Referer") || "/form-data" },
      });
    }

    console.log({ validatedData });

    return new Response(null, {
      status: 303,
      headers: { Location: req.headers.get("Referer") || "/form-data" },
    });
  },
};

export default function ({ data }) {
  return (
    <form
      method="post"
      style="display: flex; flex-direction: column; align-items:start;"
    >
      <label for="username">Username</label>
      <input id="username" name="username" />
      {!!error(data.errors, "username") && (
        <p>{error(data.errors, "username")?.message}</p>
      )}

      <label for="password">Password</label>
      <input id="password" name="password" />
      {!!error(data.errors, "password") && (
        <p>{error(data.errors, "password")?.message}</p>
      )}

      <label for="count">Count</label>
      <input id="count" name="count" />
      {!!error(data.errors, "count") && (
        <p>{error(data.errors, "count")?.message}</p>
      )}

      <label for="date">Date</label>
      <input id="date" type="datetime-local" name="date" />
      {!!error(data.errors, "date") && (
        <p>{error(data.errors, "date")?.message}</p>
      )}

      <label for="agree">Agree to TOS</label>
      <input id="agree" type="checkbox" name="agree" />
      {!!error(data.errors, "agree") && (
        <p>{error(data.errors, "agree")?.message}</p>
      )}

      <h3 for="runtime">Choose the best runtime</h3>

      {!!error(data.errors, "runtime") && (
        <p>{error(data.errors, "runtime")?.message}</p>
      )}

      <div>
        <input id="node" type="radio" name="runtime" value="node" />
        <label for="node">Node.js</label>
      </div>

      <div>
        <input id="Deno" type="radio" name="runtime" value="deno" />
        <label for="Deno">Deno</label>
      </div>

      <div>
        <input id="bun" type="radio" name="runtime" value="bun" />
        <label for="bun">Bun.js</label>
      </div>

      <button type="submit">Submit</button>
    </form>
  );
}
