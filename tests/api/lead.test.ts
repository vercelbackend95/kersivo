import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { POST } from "../../src/pages/api/lead/index.ts";

function makeLeadRequest(body: Record<string, unknown>) {
  return new Request("http://localhost/api/lead", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("POST /api/lead", () => {
  const originalFetch = globalThis.fetch;
  const originalEnv = { ...process.env };

  beforeEach(() => {
    process.env.RESEND_API_KEY = "test-resend-key";
    process.env.CONTACT_TO = "inbox@example.com";
    globalThis.fetch = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ id: "re_test" }), {
        status: 200,
        headers: { "content-type": "application/json" },
      }),
    );
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
    process.env = { ...originalEnv };
    vi.restoreAllMocks();
  });

  it("includes optional website in the email payload (website is not honeypot)", async () => {
    const websiteUrl = "https://client-website.example";
    const res = await POST({
      request: makeLeadRequest({
        name: "Jane",
        email: "jane@example.com",
        message: "Need help with redesign and migration, at least ten chars.",
        website: websiteUrl,
        service: "Website",
        budget: "",
        _hp: "",
        startedAt: Date.now() - 10_000,
      }),
    } as Parameters<typeof POST>[0]);

    expect(res.status).toBe(200);
    expect(await res.json()).toEqual(expect.objectContaining({ ok: true }));

    expect(globalThis.fetch).toHaveBeenCalledTimes(1);
    const [, init] = vi.mocked(globalThis.fetch).mock.calls[0];
    const payload = JSON.parse(String(init?.body));
    expect(payload.html).toContain(websiteUrl);
    expect(payload.subject).toContain("[/]");
    expect(payload.html).toContain("Lead source:</b> /");
  });

  it("reflects _source in the email when set to an allowed path", async () => {
    const res = await POST({
      request: makeLeadRequest({
        name: "Jane",
        email: "jane@example.com",
        message: "Need help with redesign and migration, at least ten chars.",
        _source: "/packages",
        service: "Website",
        budget: "",
        _hp: "",
        startedAt: Date.now() - 10_000,
      }),
    } as Parameters<typeof POST>[0]);

    expect(res.status).toBe(200);

    const [, init] = vi.mocked(globalThis.fetch).mock.calls[0];
    const payload = JSON.parse(String(init?.body));
    expect(payload.subject).toContain("[/packages]");
    expect(payload.html).toContain("/packages");
  });

  it("reflects nested paths such as /studio in the email", async () => {
    const res = await POST({
      request: makeLeadRequest({
        name: "Jane",
        email: "jane@example.com",
        message: "Need help with redesign and migration, at least ten chars.",
        _source: "/studio",
        service: "Website",
        budget: "",
        _hp: "",
        startedAt: Date.now() - 10_000,
      }),
    } as Parameters<typeof POST>[0]);

    expect(res.status).toBe(200);
    const [, init] = vi.mocked(globalThis.fetch).mock.calls[0];
    const payload = JSON.parse(String(init?.body));
    expect(payload.subject).toContain("[/studio]");
    expect(payload.html).toContain("Lead source:</b> /studio");
  });

  it("maps invalid _source to an em dash in the email", async () => {
    const res = await POST({
      request: makeLeadRequest({
        name: "Jane",
        email: "jane@example.com",
        message: "Need help with redesign and migration, at least ten chars.",
        _source: "https://evil.example/phish",
        service: "Website",
        budget: "",
        _hp: "",
        startedAt: Date.now() - 10_000,
      }),
    } as Parameters<typeof POST>[0]);

    expect(res.status).toBe(200);
    const [, init] = vi.mocked(globalThis.fetch).mock.calls[0];
    const payload = JSON.parse(String(init?.body));
    expect(payload.html).toContain("Lead source:</b> —");
  });

  it("does not call Resend when honeypot _hp is filled", async () => {
    const res = await POST({
      request: makeLeadRequest({
        name: "Bot",
        email: "bot@example.com",
        message: "xxxxxxxxxxxxxxxxxxxx",
        website: "https://ignored.example",
        _hp: "trap",
        startedAt: Date.now() - 10_000,
      }),
    } as Parameters<typeof POST>[0]);

    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ ok: true });
    expect(globalThis.fetch).not.toHaveBeenCalled();
  });
});
