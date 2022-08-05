/** @jsx h */
/** @jsxFrag Fragment */
import { Fragment, h } from "preact";
import { useState } from "preact/hooks";
import { error, z, ZodIssue } from "fresh-validation";
import { validateFormData } from "../../../src/mod.ts";
import testShape from "@/shapes/test.ts";

export default function ({ data }) {
  const [errors, setErrors] = useState<ZodIssue[]>([]);

  return (
    <form
      method="post"
      style="display: flex; flex-direction: column; align-items:start;"
      onSubmit={async (e) => {
        e.preventDefault();

        const { validatedData, errors } = await validateFormData(
          new FormData(e.target),
          {
            username: z.any().nullable(),
            password: z.any().nullable(),
            count: z.any().nullable(),
            date: z.any().nullable(),
            agree: z.any().nullable(),
            runtime: z.any().nullable(),
          },
        );

        if (errors) {
          return setErrors(errors);
        }

        fetch("/json", {
          method: "POST",
          body: JSON.stringify(validatedData),
          headers: { "Content-Type": "application/json" },
        }).then(async (response) => {
          if (response.status === 422) {
            const { errors } = await response.json();
            return setErrors(errors);
          }
          //
        });
      }}
    >
      <label for="username">Username</label>
      <input id="username" name="username" />
      {!!error(errors, "username") && (
        <p>{error(errors, "username")?.message}</p>
      )}

      <label for="password">Password</label>
      <input id="password" name="password" />
      {!!error(errors, "password") && (
        <p>{error(errors, "password")?.message}</p>
      )}

      <label for="count">Count</label>
      <input id="count" name="count" />
      {!!error(errors, "count") && <p>{error(errors, "count")?.message}</p>}

      <label for="date">Date</label>
      <input id="date" type="datetime-local" name="date" />
      {!!error(errors, "date") && <p>{error(errors, "date")?.message}</p>}

      <label for="agree">Agree to TOS</label>
      <input id="agree" type="checkbox" name="agree" />
      {!!error(errors, "agree") && <p>{error(errors, "agree")?.message}</p>}

      <h3 for="runtime">Choose the best runtime</h3>

      {!!error(errors, "runtime") && <p>{error(errors, "runtime")?.message}</p>}

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
