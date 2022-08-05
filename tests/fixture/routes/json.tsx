/** @jsx h */
/** @jsxFrag Fragment */
import { Fragment, h } from "preact";
import { z } from "fresh-validation";
import { Handlers } from "$fresh/server.ts";
import Form from "@/islands/Form.tsx";
import { validateJSON } from "../../../src/mod.ts";
import testShape from "@/shapes/test.ts";

export const handler: Handlers = {
  async POST(req) {
    const data = await req.json();
    const { validatedData, errors } = await validateJSON(data, testShape);

    if (errors) {
      return new Response(JSON.stringify({ errors }), {
        status: 422,
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response(null, {
      status: 204,
      headers: { "Content-Type": "application/json" },
    });
  },
};

export default function ({ data }) {
  return <Form {...{ data }} />;
}
