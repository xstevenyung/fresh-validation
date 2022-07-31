/// <reference no-default-lib="true" />
/// <reference lib="dom" />
/// <reference lib="dom.asynciterable" />
/// <reference lib="deno.ns" />
/// <reference lib="deno.unstable" />
/** @jsx h */
import { h } from "preact";
import { renderToString } from "preact-render-to-string";
import { z } from "zod";
import { useForm } from "../mod.ts";

Deno.test("Test", () => {
  const schema = z.object({
    username: z.string().email(),
    password: z.string().min(6),
    website: z.string().url(),
    uuid: z.string().uuid().optional(),
  });

  const { register } = useForm(schema);

  console.log(renderToString(<input {...register("username")} />));
  console.log(
    renderToString(<input {...register("password")} />),
  );
  console.log(
    renderToString(<input {...register("website")} />),
  );
  console.log(
    renderToString(<input {...register("uuid")} />),
  );
});
