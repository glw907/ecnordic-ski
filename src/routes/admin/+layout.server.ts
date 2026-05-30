// /admin must never be prerendered (dynamic auth and content). The authed shell load lives in
// the (app) group, so login and auth do not run the session-requiring layout load and cannot loop.
export const prerender = false;
