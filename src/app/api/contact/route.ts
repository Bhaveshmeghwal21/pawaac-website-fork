import { NextRequest, NextResponse } from "next/server";
import { contactSchema } from "@/lib/schemas";
import {
  deliverLead,
  formatLeadFields,
  isLeadDeliveryConfigured,
} from "@/lib/leadDelivery";
import { clientKeyFromHeaders, rateLimit } from "@/lib/rateLimit";

// Demo-request handler.
//
// This used to parse, validate, `console.log` and return `{ ok: true }`, with a
// comment describing the email wiring as future work — while ContactForm.tsx
// told the sender "Request received. We'll contact you within 24 hours." The
// wiring now exists (src/lib/leadDelivery.ts) and the success response means
// what the UI claims it means.
//
// Response contract, which ContactForm.tsx branches on:
//   200 { ok: true }                     delivered
//   400 { ok: false, errors }            validation failed (field-level)
//   429 { ok: false, message }           rate limited
//   503 { ok: false, message, unavailable: true }
//                                        delivery not configured on this
//                                        deployment; the visitor is told to
//                                        email directly rather than being
//                                        thanked for a message nobody received
//   502 { ok: false, message }           provider refused; retry may work

// 5 submissions per 10 minutes per caller. A real prospect fills this in once;
// anything past 5 is a mistake or a script.
const LIMIT = 5;
const WINDOW_MS = 10 * 60 * 1000;

// A JSON contact form has no business being large. Checked before reading the
// body so an oversized payload is rejected rather than buffered.
const MAX_BODY_BYTES = 16 * 1024;

export async function POST(req: NextRequest) {
  const limit = rateLimit(
    `contact:${clientKeyFromHeaders(req.headers)}`,
    LIMIT,
    WINDOW_MS,
  );
  if (!limit.allowed) {
    return NextResponse.json(
      {
        ok: false,
        message: "Too many requests. Please try again shortly.",
      },
      { status: 429, headers: { "Retry-After": String(limit.retryAfterSeconds) } },
    );
  }

  const declaredLength = Number(req.headers.get("content-length") ?? 0);
  if (declaredLength > MAX_BODY_BYTES) {
    return NextResponse.json(
      { ok: false, message: "Request body too large." },
      { status: 413 },
    );
  }

  const body = await req.json().catch(() => null);
  const parsed = contactSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, errors: parsed.error.flatten().fieldErrors },
      { status: 400 },
    );
  }

  // Checked before attempting a send so a misconfigured deployment gives the
  // visitor an accurate answer instead of a false confirmation.
  if (!isLeadDeliveryConfigured()) {
    console.error(
      "[contact] delivery not configured; submission was NOT accepted",
    );
    return NextResponse.json(
      {
        ok: false,
        unavailable: true,
        message:
          "The form is temporarily unavailable. Please email kshitij@pawaac.com directly.",
      },
      { status: 503 },
    );
  }

  const { name, organization, role, email, phone, useCase, message } =
    parsed.data;

  const result = await deliverLead({
    subject: `Demo request: ${organization} (${name})`,
    replyTo: email,
    text: [
      formatLeadFields([
        ["Name", name],
        ["Organization", organization],
        ["Role", role],
        ["Email", email],
        ["Phone", phone],
        ["Use case", useCase],
      ]),
      "",
      "Message:",
      message,
    ].join("\n"),
  });

  if (!result.ok) {
    // Server-side only. The submitter's details stay out of the response.
    console.error(`[contact] delivery failed (${result.reason}):`, result.detail);

    if (result.reason === "not-configured") {
      return NextResponse.json(
        {
          ok: false,
          unavailable: true,
          message:
            "The form is temporarily unavailable. Please email kshitij@pawaac.com directly.",
        },
        { status: 503 },
      );
    }

    return NextResponse.json(
      {
        ok: false,
        message:
          "We could not send your request. Please try again, or email kshitij@pawaac.com.",
      },
      { status: 502 },
    );
  }

  return NextResponse.json({ ok: true });
}
