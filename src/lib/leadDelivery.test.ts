import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  deliverLead,
  formatLeadFields,
  isLeadDeliveryConfigured,
} from "./leadDelivery";

// The invariant these tests exist to protect:
//
//   deliverLead() must never report `ok: true` unless a lead was actually
//   handed to the provider successfully.
//
// The bug this module replaced was precisely the opposite — the routes returned
// success unconditionally and the UI told the sender "We'll contact you within
// 24 hours" while the submission went to stdout and nowhere else. A regression
// here is silent by nature: the form keeps looking like it works.

const ORIGINAL_ENV = { ...process.env };

function setEnv(env: Record<string, string | undefined>) {
  for (const key of ["RESEND_API_KEY", "LEAD_FROM_EMAIL", "LEAD_TO_EMAIL"]) {
    delete process.env[key];
  }
  for (const [key, value] of Object.entries(env)) {
    if (value !== undefined) process.env[key] = value;
  }
}

beforeEach(() => {
  vi.restoreAllMocks();
});

afterEach(() => {
  process.env = { ...ORIGINAL_ENV };
});

describe("isLeadDeliveryConfigured", () => {
  it("requires both an API key and a verified sender", () => {
    setEnv({ RESEND_API_KEY: "re_test", LEAD_FROM_EMAIL: "site@example.com" });
    expect(isLeadDeliveryConfigured()).toBe(true);

    setEnv({ RESEND_API_KEY: "re_test" });
    expect(isLeadDeliveryConfigured()).toBe(false);

    setEnv({ LEAD_FROM_EMAIL: "site@example.com" });
    expect(isLeadDeliveryConfigured()).toBe(false);

    setEnv({});
    expect(isLeadDeliveryConfigured()).toBe(false);
  });

  it("treats whitespace-only values as unset", () => {
    setEnv({ RESEND_API_KEY: "   ", LEAD_FROM_EMAIL: "site@example.com" });
    expect(isLeadDeliveryConfigured()).toBe(false);
  });
});

describe("deliverLead", () => {
  it("fails with `not-configured` and never calls the provider when env is missing", async () => {
    setEnv({});
    const fetchSpy = vi.fn();
    vi.stubGlobal("fetch", fetchSpy);

    const result = await deliverLead({ subject: "s", text: "t" });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.reason).toBe("not-configured");
      expect(result.detail).toContain("RESEND_API_KEY");
      expect(result.detail).toContain("LEAD_FROM_EMAIL");
    }
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("posts the lead to Resend with auth, recipient and reply-to, and reports success", async () => {
    setEnv({
      RESEND_API_KEY: "re_test",
      LEAD_FROM_EMAIL: "site@example.com",
      LEAD_TO_EMAIL: "leads@example.com",
    });
    const fetchSpy = vi.fn(async () => new Response("{}", { status: 200 }));
    vi.stubGlobal("fetch", fetchSpy);

    const result = await deliverLead({
      subject: "Demo request: Acme",
      text: "Name: Ada",
      replyTo: "ada@acme.test",
    });

    expect(result).toEqual({ ok: true });
    expect(fetchSpy).toHaveBeenCalledTimes(1);

    const [url, init] = fetchSpy.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toBe("https://api.resend.com/emails");
    expect(init.method).toBe("POST");
    expect(
      (init.headers as Record<string, string>).Authorization,
    ).toBe("Bearer re_test");

    const payload = JSON.parse(init.body as string);
    expect(payload.from).toBe("site@example.com");
    expect(payload.to).toEqual(["leads@example.com"]);
    expect(payload.subject).toBe("Demo request: Acme");
    // snake_case: Resend's REST field name, not the SDK's replyTo.
    expect(payload.reply_to).toBe("ada@acme.test");
  });

  it("defaults the recipient when LEAD_TO_EMAIL is unset", async () => {
    setEnv({ RESEND_API_KEY: "re_test", LEAD_FROM_EMAIL: "site@example.com" });
    const fetchSpy = vi.fn(async () => new Response("{}", { status: 200 }));
    vi.stubGlobal("fetch", fetchSpy);

    await deliverLead({ subject: "s", text: "t" });

    const [, init] = fetchSpy.mock.calls[0] as unknown as [string, RequestInit];
    expect(JSON.parse(init.body as string).to).toEqual(["kshitij@pawaac.com"]);
  });

  it("base64-encodes attachments so a resume survives the JSON transport", async () => {
    setEnv({ RESEND_API_KEY: "re_test", LEAD_FROM_EMAIL: "site@example.com" });
    const fetchSpy = vi.fn(async () => new Response("{}", { status: 200 }));
    vi.stubGlobal("fetch", fetchSpy);

    const bytes = new TextEncoder().encode("PDF-BYTES");

    await deliverLead({
      subject: "Job application: Ada",
      text: "Name: Ada",
      attachments: [{ filename: "resume.pdf", content: bytes.buffer }],
    });

    const [, init] = fetchSpy.mock.calls[0] as unknown as [string, RequestInit];
    const payload = JSON.parse(init.body as string);
    expect(payload.attachments).toHaveLength(1);
    expect(payload.attachments[0].filename).toBe("resume.pdf");
    expect(
      Buffer.from(payload.attachments[0].content, "base64").toString("utf8"),
    ).toBe("PDF-BYTES");
  });

  it("reports `provider-error` on a non-2xx response rather than claiming success", async () => {
    setEnv({ RESEND_API_KEY: "re_test", LEAD_FROM_EMAIL: "site@example.com" });
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => new Response("domain not verified", { status: 403 })),
    );

    const result = await deliverLead({ subject: "s", text: "t" });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.reason).toBe("provider-error");
      expect(result.detail).toContain("403");
    }
  });

  it("reports `provider-error` when the request itself throws", async () => {
    setEnv({ RESEND_API_KEY: "re_test", LEAD_FROM_EMAIL: "site@example.com" });
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => {
        throw new Error("network down");
      }),
    );

    const result = await deliverLead({ subject: "s", text: "t" });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.reason).toBe("provider-error");
      expect(result.detail).toBe("network down");
    }
  });
});

describe("formatLeadFields", () => {
  it("renders label/value lines and omits empty optional fields", () => {
    expect(
      formatLeadFields([
        ["Name", "Ada"],
        ["Role", undefined],
        ["Phone", "   "],
        ["Email", "ada@acme.test"],
      ]),
    ).toBe("Name: Ada\nEmail: ada@acme.test");
  });
});
