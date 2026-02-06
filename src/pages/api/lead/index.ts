export const prerender = false;

import type { APIRoute } from "astro";

export const POST: APIRoute = async ({ request }) => {
  try {
    const ct = request.headers.get("content-type") || "";

    if (ct.includes("multipart/form-data")) {
      const form = await request.formData();
      return new Response(
        JSON.stringify({ ok: true, keys: Array.from(form.keys()) }),
        { status: 200, headers: { "content-type": "application/json; charset=utf-8" } }
      );
    }

    if (ct.includes("application/json")) {
      const body = await request.json().catch(() => ({}));
      return new Response(JSON.stringify({ ok: true, received: body }), {
        status: 200,
        headers: { "content-type": "application/json; charset=utf-8" },
      });
    }

    return new Response(JSON.stringify({ ok: false, error: "Unsupported content-type" }), {
      status: 415,
      headers: { "content-type": "application/json; charset=utf-8" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ ok: false, error: "Server error" }), {
      status: 500,
      headers: { "content-type": "application/json; charset=utf-8" },
    });
  }
};
