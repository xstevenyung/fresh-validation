import { MiddlewareHandlerContext } from "$fresh/server.ts";
import { cookieSession, WithSession } from "fresh-session";

export function handler(
  req: Request,
  ctx: MiddlewareHandlerContext<WithSession>,
) {
  return cookieSession(req, ctx);
}
