import { NextRequest, NextResponse } from "next/server";
import { careersSchema, MAX_APPLICATION_FILE_SIZE_BYTES } from "@/lib/schemas";
import {
  deliverLead,
  formatLeadFields,
  isLeadDeliveryConfigured,
  type LeadAttachment,
} from "@/lib/leadDelivery";
import { clientKeyFromHeaders, rateLimit } from "@/lib/rateLimit";

// Spec: pawaac-design-language-evolution — Task 15 (Careers_Page route)
// Requirements: 9.2
// Design: design.md -> Page Specifications -> Careers_Page, Section 2
//         (Uplink_Form / application form)
//
// Parses the multipart form data and re-validates file type/size server-side
// via `careersSchema` (never trusting the client alone) — a browser `File`
// structurally satisfies the `{ type, size }` shape `applicationFileSchema`
// checks, so the identical schema runs on both sides.
//
// Changed from the original task-15 implementation, which logged the accepted
// submission's metadata and returned `{ ok: true }` while
// CareersApplicationForm.tsx displayed "Application received. We'll be in
// touch." Résumés are now forwarded as real email attachments through
// src/lib/leadDelivery.ts, and a deployment that cannot deliver says so instead
// of quietly discarding an application. Response contract matches
// ../contact/route.ts.

// Applications are rarer than demo requests and carry an upload, so the window
// is tighter.
const LIMIT = 3;
const WINDOW_MS = 15 * 60 * 1000;

// Resume + optional cover letter, each capped at 8 MB by the schema, plus
// multipart overhead and the text fields. Checked from `content-length` BEFORE
// `req.formData()`, which would otherwise buffer the entire body into memory
// before any size rule was applied.
const MAX_BODY_BYTES = 2 * MAX_APPLICATION_FILE_SIZE_BYTES + 1024 * 1024;

/** Strips directories and anything not filename-safe from a client filename. */
function safeFilename(name: string, fallback: string): string {
  const base = name.split(/[\\/]/).pop() ?? "";
  const cleaned = base.replace(/[^A-Za-z0-9._-]/g, "_").slice(0, 120);
  return cleaned.length > 0 ? cleaned : fallback;
}

export async function POST(req: NextRequest) {
  const limit = rateLimit(
    `careers:${clientKeyFromHeaders(req.headers)}`,
    LIMIT,
    WINDOW_MS,
  );
  if (!limit.allowed) {
    return NextResponse.json(
      { ok: false, message: "Too many requests. Please try again shortly." },
      { status: 429, headers: { "Retry-After": String(limit.retryAfterSeconds) } },
    );
  }

  const declaredLength = Number(req.headers.get("content-length") ?? 0);
  if (declaredLength > MAX_BODY_BYTES) {
    return NextResponse.json(
      { ok: false, message: "Upload too large." },
      { status: 413 },
    );
  }

  const formData = await req.formData().catch(() => null);

  if (!formData) {
    return NextResponse.json(
      { ok: false, errors: { root: ["Invalid form data"] } },
      { status: 400 },
    );
  }

  const coverLetter = formData.get("coverLetter");

  const parsed = careersSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    resume: formData.get("resume"),
    coverLetter:
      coverLetter instanceof File && coverLetter.size > 0
        ? coverLetter
        : undefined,
  });

  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, errors: parsed.error.flatten().fieldErrors },
      { status: 400 },
    );
  }

  if (!isLeadDeliveryConfigured()) {
    console.error(
      "[careers] delivery not configured; application was NOT accepted",
    );
    return NextResponse.json(
      {
        ok: false,
        unavailable: true,
        message:
          "Applications are temporarily unavailable. Please email your resume to kshitij@pawaac.com.",
      },
      { status: 503 },
    );
  }

  // The schema validates `{ type, size }` metadata, which is all it needs. To
  // attach the files we need the actual bytes, so re-read them from the form
  // data as `File`s. Anything that passed validation without being a real File
  // (possible given the structural check) cannot be attached, and an
  // application that arrives without its resume is worse than a clear error.
  const resumeField = formData.get("resume");
  if (!(resumeField instanceof File)) {
    return NextResponse.json(
      { ok: false, errors: { resume: ["Could not read the uploaded file."] } },
      { status: 400 },
    );
  }

  const attachments: LeadAttachment[] = [
    {
      filename: safeFilename(resumeField.name, "resume"),
      content: await resumeField.arrayBuffer(),
    },
  ];

  if (coverLetter instanceof File && coverLetter.size > 0) {
    attachments.push({
      filename: safeFilename(coverLetter.name, "cover-letter"),
      content: await coverLetter.arrayBuffer(),
    });
  }

  const { name, email } = parsed.data;

  const result = await deliverLead({
    subject: `Job application: ${name}`,
    replyTo: email,
    text: [
      formatLeadFields([
        ["Name", name],
        ["Email", email],
      ]),
      "",
      `Attachments: ${attachments.map((a) => a.filename).join(", ")}`,
    ].join("\n"),
    attachments,
  });

  if (!result.ok) {
    console.error(`[careers] delivery failed (${result.reason}):`, result.detail);

    if (result.reason === "not-configured") {
      return NextResponse.json(
        {
          ok: false,
          unavailable: true,
          message:
            "Applications are temporarily unavailable. Please email your resume to kshitij@pawaac.com.",
        },
        { status: 503 },
      );
    }

    return NextResponse.json(
      {
        ok: false,
        message:
          "We could not send your application. Please try again, or email kshitij@pawaac.com.",
      },
      { status: 502 },
    );
  }

  return NextResponse.json({ ok: true });
}
