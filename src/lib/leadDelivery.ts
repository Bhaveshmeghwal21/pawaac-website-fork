// Lead delivery.
//
// Both form endpoints previously validated a submission, wrote it to stdout
// with console.log, and returned `{ ok: true }` — while the UI told the sender
// "Request received. We'll contact you within 24 hours." Every demo request and
// every job application was discarded, and the sender was told otherwise. This
// module is what makes that promise true.
//
// Transport is Resend's REST API called with plain `fetch`, deliberately not
// their SDK: the whole integration is one POST, and adding a dependency to a
// launch-day build buys nothing. The provider was already named in the TODO
// comment this replaces (src/app/api/contact/route.ts).
//
// THE IMPORTANT DESIGN DECISION: when delivery is not configured, or the
// provider rejects the send, these functions report failure and the route
// returns a non-2xx status. It does NOT fall back to logging and claiming
// success. A form that silently swallows leads is worse than a form that says
// it is broken, because nobody goes looking for the second kind. See
// `LeadDeliveryFailure.reason` for what each case means.
//
// Required environment variables:
//   RESEND_API_KEY   Resend API key.
//   LEAD_FROM_EMAIL  Sender, on a domain verified in Resend (e.g.
//                    "PAWAAC site <website@pawaac.com>"). Resend rejects sends
//                    from unverified domains, so this cannot default to
//                    anything useful.
//   LEAD_TO_EMAIL    Recipient. Defaults to the address named in the original
//                    TODO comment.

const RESEND_ENDPOINT = "https://api.resend.com/emails";

const DEFAULT_LEAD_RECIPIENT = "kshitij@pawaac.com";

export type LeadDeliveryFailure = {
  ok: false;
  /**
   * `not-configured` — the deployment is missing RESEND_API_KEY or
   * LEAD_FROM_EMAIL. An operator has to fix the environment; retrying will not
   * help, so the route reports 503 and the UI tells the visitor to email
   * directly.
   *
   * `provider-error` — credentials exist but Resend refused or the request
   * failed. Possibly transient, so the UI invites a retry.
   */
  reason: "not-configured" | "provider-error";
  detail: string;
};

export type LeadDeliveryResult = { ok: true } | LeadDeliveryFailure;

export type LeadAttachment = {
  filename: string;
  /** Raw bytes; base64-encoded here before handing to the provider. */
  content: ArrayBuffer;
};

export type LeadMessage = {
  subject: string;
  /** Plain-text body. No HTML: these go to a human inbox, not a newsletter. */
  text: string;
  /** The submitter's address, so a reply goes straight back to them. */
  replyTo?: string;
  attachments?: LeadAttachment[];
};

function readConfig() {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  const from = process.env.LEAD_FROM_EMAIL?.trim();
  const to = process.env.LEAD_TO_EMAIL?.trim() || DEFAULT_LEAD_RECIPIENT;
  return { apiKey, from, to };
}

/**
 * Whether this deployment can actually deliver a lead. Routes use it to fail
 * fast with a clear message instead of accepting a submission they cannot
 * forward.
 */
export function isLeadDeliveryConfigured(): boolean {
  const { apiKey, from } = readConfig();
  return !!apiKey && !!from;
}

function toBase64(buffer: ArrayBuffer): string {
  return Buffer.from(buffer).toString("base64");
}

export async function deliverLead(
  message: LeadMessage,
): Promise<LeadDeliveryResult> {
  const { apiKey, from, to } = readConfig();

  if (!apiKey || !from) {
    const missing = [
      !apiKey && "RESEND_API_KEY",
      !from && "LEAD_FROM_EMAIL",
    ].filter(Boolean);
    return {
      ok: false,
      reason: "not-configured",
      detail: `Lead delivery is not configured: missing ${missing.join(" and ")}.`,
    };
  }

  const payload: Record<string, unknown> = {
    from,
    to: [to],
    subject: message.subject,
    text: message.text,
  };

  // Resend's REST API uses snake_case here (its Node SDK maps `replyTo` onto
  // this field).
  if (message.replyTo) payload.reply_to = message.replyTo;

  if (message.attachments?.length) {
    payload.attachments = message.attachments.map((a) => ({
      filename: a.filename,
      content: toBase64(a.content),
    }));
  }

  try {
    const res = await fetch(RESEND_ENDPOINT, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
      // Don't let a hanging provider hold the request open indefinitely.
      signal: AbortSignal.timeout(10_000),
    });

    if (!res.ok) {
      // Read the provider's message for the server log, but never return it to
      // the client — it can echo configuration details.
      const detail = await res.text().catch(() => "");
      return {
        ok: false,
        reason: "provider-error",
        detail: `Resend responded ${res.status}: ${detail.slice(0, 500)}`,
      };
    }

    return { ok: true };
  } catch (error) {
    return {
      ok: false,
      reason: "provider-error",
      detail: error instanceof Error ? error.message : "Unknown transport error",
    };
  }
}

/** Formats a `key: value` block, skipping blanks, for the email body. */
export function formatLeadFields(
  fields: Array<[label: string, value: string | undefined]>,
): string {
  return fields
    .filter(([, value]) => value && value.trim().length > 0)
    .map(([label, value]) => `${label}: ${value}`)
    .join("\n");
}
