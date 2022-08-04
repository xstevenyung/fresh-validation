/** @jsx h */
/** @jsxFrag Fragment */
import { Fragment, h } from "preact";
import { z } from "fresh-validation";
import { Handlers } from "$fresh/server.ts";
import Form from "@/islands/Form.tsx";
import { validateJSON } from "../../../src/mod.ts";
import testShape from "@/shapes/test.ts";

globalThis.errors = null;

export const handler: Handlers = {
  GET: (req, ctx) => {
    const errors = globalThis.errors;
    globalThis.errors = null;
    return ctx.render({ errors });
  },

  async POST(req) {
    const data = await req.json();
    console.log(data);
    const { validatedData, errors } = await validateJSON(data, testShape);

    if (errors) {
      console.log({ errors });
      return new Response(null, {
        status: 422,
        headers: { "Content-Type": "application/json" },
      });
    }

    console.log({ validatedData });

    return new Response(null, {
      status: 204,
      headers: { "Content-Type": "application/json" },
    });
  },
};

export default function ({ data }) {
  return <Form {...{ data }} />;
}
