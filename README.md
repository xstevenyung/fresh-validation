# Fresh Validation 🍋   [![Badge License]][License]

Easily validate `FormData`, `URLSearchParams` and JSON data in your Fresh app
server-side or client-side!

<br>

## Validation

Fresh Validation is built on top of [Zod](https://zod.dev/). For more
information on different validation rules you can check
[Zod's documentation](https://zod.dev/).

## Getting Started

You can use Fresh Validation directly without any setup:

### Validate `FormData`

`FormData` are natively support on the web platform but suffer from loosing data
typing as all data are plain string when sent through the wire.

By using `validateFormData`, we can validate and cast back our data to the right
type.

```tsx
// routes/login.tsx
/** @jsx h */
import { h } from "preact";
import {
  error,
  validateFormData,
  z,
  ZodIssue,
} from "https://deno.land/x/fresh_validation@0.1.0/mod.ts";
import { Handlers } from "$fresh/server.ts";
import type { WithSession } from "https://deno.land/x/fresh_session@0.1.7/mod.ts";

export const handler: Handlers<{ errors: ZodIssue[] }, WithSession> = {
  GET(req, ctx) {
    // We use Fresh Session to flash errors and pass it down to the page
    // more info: https://github.com/xstevenyung/fresh-session
    const errors = ctx.state.session.flash("errors");
    return ctx.render({ errors });
  },

  async POST(req, ctx) {
    // We just need this to validate our FormData
    const { validatedData, errors } = await validateFormData(req, {
      username: z.string().min(2),
      password: z.string().min(8),
    });

    // `errors` will be null if the validation is correct
    if (errors) {
      // we can deal with errors here
      // we recommand using Fresh Session to pass errors between endpoints
      // more info: https://github.com/xstevenyung/fresh-session
      ctx.state.session.flash("errors", errors);
    }

    // here we get back the validated data casted to the right type
    validatedData.username;
    validatedData.password;

    // For the sake of the example, we will redirect to the dashboard after a successful login
    return new Response(null, {
      status: 303,
      headers: { Location: "/dashboard" },
    });
  },
};

export default function ({ data }) {
  return (
    <form method="post">
      <label
        for="username"
        // We can display a specific class or style if there is any errors on a specific field
        class={error(data.errors, "username") ? "invalid" : ""}
      >
        Username
      </label>
      <input id="username" name="username" />
      {/* And we can use the `error` function to retrieve the right error to display to the user*/}
      {!!error(data.errors, "username") && (
        <p>{error(data.errors, "username")?.message}</p>
      )}

      <label for="password">Password</label>
      <input id="password" name="password" />
      {!!error(data.errors, "password") && (
        <p>{error(data.errors, "password")?.message}</p>
      )}
    </form>
  );
}
```

### Validate `URLSearchParams`

`URLSearchParams` works the same as `FormData`.

```tsx
// routes/search.tsx
/** @jsx h */
import { h } from "preact";
import {
  error,
  validate,
  z,
  ZodIssue,
} from "https://deno.land/x/fresh_validation@0.1.0/mod.ts";
import testShape from "@/shapes/test.ts";
import { Handlers } from "$fresh/server.ts";
import type { WithSession } from "https://deno.land/x/fresh_session@0.1.7/mod.ts";

export const handler: Handlers<{ errors: ZodIssue[] }, WithSession> = {
  GET(req, ctx) {
    // Validate search params
    const { validatedData, errors } = await validateSearchParams(req, {
      q: z.string().nullable(),
      page: z.number().default(1),
    });

    if (errors) {
      // We can deal with errors here but in our example, it's not necessary
    }

    // We can then use it here
    validatedData.q;
    validatedData.page;

    return ctx.render({ validatedData });
  },
};

export default function ({ data }) {
  return (
    <form method="get">
      <input id="search" name="search" />

      <a href="/search?page=2">Page 2</a>
    </form>
  );
}
```

### Validate `JSON`

`validateJSON` will extract the `req.json()` and validate against a
[Zod schema](https://github.com/colinhacks/zod#introduction)

Note: We transform any date into a `Date` instance to simplify validation with
Zod

```tsx
// routes/login.tsx
/** @jsx h */
import { h } from "preact";
import {
  validateJSON,
  z,
} from "https://deno.land/x/fresh_validation@0.1.0/mod.ts";
import { Handlers } from "$fresh/server.ts";
import Form from "../islands/LoginForm.tsx";

export const handler: Handlers = {
  GET: (req, ctx) => {
    return ctx.render({ errors });
  },

  async POST(req) {
    const { validatedData, errors } = await validateJSON(req, {
      username: z.string().min(2),
      password: z.string().min(8),
    });

    if (errors) {
      // We deal with errors here
      return new Response(JSON.stringify(errors), {
        status: 422,
        headers: { "Content-Type": "application/json" },
      });
    }

    // We can access validatedData here
    validatedData.username;
    validatedData.password;

    return new Response(null, {
      status: 204,
      headers: { "Content-Type": "application/json" },
    });
  },
};

export default function ({ data }) {
  return <Form />;
}
```

```tsx
// islands/LoginForm.tsx
/** @jsx h */
import { h } from "preact";
import { useState } from "preact/hooks";
import {
  error,
  validateFormData,
  z,
  ZodIssue,
} from "https://deno.land/x/fresh_validation@0.1.0/mod.ts";

export default function ({ data }) {
  const [errors, setErrors] = useState<ZodIssue[]>([]);

  return (
    <form
      method="post"
      onSubmit={async (e) => {
        e.preventDefault();

        // We can even do client-side validation with the exact same code!
        const { validatedData, errors } = await validateFormData(
          new FormData(e.target),
          {
            username: z.string().min(2),
            password: z.string().min(8),
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
          // We handle server-side errors in case there is some
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

      <button type="submit">Submit</button>
    </form>
  );
}
```

<!----------------------------------------------------------------------------->

[Fresh project]: https://fresh.deno.dev/
[Localhost]: http://localhost:8000/sitemap.xml

[License]: LICENSE


<!----------------------------------[ Badges ]--------------------------------->

[Badge License]: https://img.shields.io/badge/License-MIT-ac8b11.svg?style=for-the-badge&labelColor=yellow