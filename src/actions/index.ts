import { ActionError, defineAction } from "astro:actions";
import { getEntry } from "astro:content";
import { z } from "astro/zod";
import {
  displayStatus,
  formTitle,
  formWorkflowMeta,
  isManagedFormSlug,
} from "../lib/crm-forms";
import { fieldMapFor, fieldValue, firstValue, hasValue } from "../lib/forms";
import {
  hashIp,
  hashSecret,
  id,
  json,
  normaliseEmail,
  normalisePhone,
  nowIso,
  publicBaseUrl,
  randomToken,
  runtimeEnv,
} from "../server/db";
import { createLoginToken } from "../server/auth";
import { requestIp, withinRateLimit } from "../server/rate-limit";
import {
  createCommunication,
  emailHtml,
  emailText,
  scheduleCommunication,
} from "../server/email";

const loginInput = z.object({ email: z.email() });
const formKinds = z.enum(["contact", "service-supply", "hire-contract"]);
const inviteInput = z.object({
  formType: formKinds,
  contactId: z.string().min(1),
  enquiryId: z.string().optional(),
});
const noteInput = z.object({
  contactId: z.string().min(1),
  enquiryId: z.string().optional(),
  body: z.string().trim().min(1).max(5000),
});
const statusInput = z.object({
  enquiryId: z.string().min(1),
  status: z.enum([
    "new",
    "triaged",
    "awaiting customer details",
    "ready to schedule",
    "booked",
    "complete",
    "archived",
  ]),
});
const formWorkflowInput = z.object({
  submissionId: z.string().min(1),
  status: z.enum([
    "received",
    "reviewed",
    "ready to schedule",
    "scheduled",
    "approved",
    "active",
    "return due",
    "complete",
    "cancelled",
  ]),
  dueAt: z
    .union([z.string().regex(/^\d{4}-\d{2}-\d{2}$/), z.literal("")])
    .optional(),
});
const notificationRuleInput = z.object({
  eventType: z.enum(["form_submitted", "enquiry_created"]),
  recipientEmail: z.email(),
});
const removeNotificationRuleInput = z.object({
  id: z.string().min(1),
});
const phoneEnquiryInput = z.object({
  name: z.string().trim().min(1).max(200),
  company: z.string().trim().max(200).optional(),
  email: z.union([z.email(), z.literal("")]).optional(),
  phone: z.string().trim().min(6).max(40),
  service: z.string().trim().max(120).optional(),
  message: z.string().trim().max(5000).optional(),
  urgency: z.enum(["standard", "urgent"]).default("standard"),
});

type FormDataObject = Record<string, unknown>;

function dataObject(input: unknown): FormDataObject {
  if (input instanceof FormData) {
    const result: FormDataObject = {};
    for (const [key, value] of input.entries()) {
      const nextValue = typeof value === "string" ? value : value.name;
      if (key in result) {
        result[key] = Array.isArray(result[key])
          ? [...(result[key] as unknown[]), nextValue]
          : [result[key], nextValue];
      } else {
        result[key] = nextValue;
      }
    }
    return result;
  }
  return input && typeof input === "object" ? (input as FormDataObject) : {};
}

function valuesForFields(
  input: FormDataObject,
  definition: Awaited<ReturnType<typeof getEntry>>["data"],
): Record<string, string | string[]> {
  const values: Record<string, string | string[]> = {};
  for (const field of fieldMapFor(definition).values()) {
    const value = fieldValue(input[field.id]);
    values[field.id] = value;
  }
  return values;
}

function validateForm(
  input: FormDataObject,
  definition: NonNullable<Awaited<ReturnType<typeof getEntry>>>,
): {
  values: Record<string, string | string[]>;
  errors: Record<string, string>;
} {
  const values = valuesForFields(input, definition.data);
  const errors: Record<string, string> = {};
  const fields = fieldMapFor(definition.data);

  for (const field of fields.values()) {
    const value = values[field.id];
    if (field.required && !hasValue(value)) {
      errors[field.id] = "This field is required.";
      continue;
    }
    if (!hasValue(value)) continue;

    const list = Array.isArray(value) ? value : [value];
    if (list.some((item) => item.length > 5000)) {
      errors[field.id] = "Please keep this response under 5,000 characters.";
      continue;
    }
    if (
      field.type === "email" &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(firstValue(value))
    ) {
      errors[field.id] = "Enter a valid email address.";
    }
    if (
      field.type === "tel" &&
      firstValue(value).replace(/\D/g, "").length < 8
    ) {
      errors[field.id] = "Enter a valid phone number.";
    }
    if (
      field.type === "date" &&
      !/^\d{4}-\d{2}-\d{2}$/.test(firstValue(value))
    ) {
      errors[field.id] = "Enter a valid date.";
    }
    if (field.type === "acceptance" && firstValue(value) !== "yes") {
      errors[field.id] = "You must accept this statement to continue.";
    }
    if (field.options?.length) {
      const allowed = new Set(field.options.map((option) => option.value));
      if (list.some((item) => !allowed.has(item))) {
        errors[field.id] = "Choose one of the listed options.";
      }
    }
  }
  return { values, errors };
}

async function validateTurnstile(
  request: Request,
  input: FormDataObject,
): Promise<boolean> {
  const secret = runtimeEnv().TURNSTILE_SECRET_KEY;
  if (!secret) return true;
  const token = firstValue(input["cf-turnstile-response"]);
  if (!token || token.length > 2048) return false;
  const body = new FormData();
  body.set("secret", secret);
  body.set("response", token);
  const ip = request.headers.get("CF-Connecting-IP");
  if (ip) body.set("remoteip", ip);
  body.set("idempotency_key", crypto.randomUUID());
  try {
    const response = await fetch(
      "https://challenges.cloudflare.com/turnstile/v0/siteverify",
      {
        method: "POST",
        body,
      },
    );
    const result = (await response.json()) as {
      success?: boolean;
      hostname?: string;
    };
    return (
      response.ok &&
      result.success === true &&
      result.hostname === new URL(request.url).hostname
    );
  } catch {
    return false;
  }
}

async function upsertContact(input: {
  id?: string;
  name: string;
  email?: string;
  phone?: string;
  company?: string;
}): Promise<string> {
  const current = runtimeEnv();
  const email = normaliseEmail(input.email);
  const phone = normalisePhone(input.phone);
  const company = input.company?.trim() || "";
  let contact = input.id
    ? await current.DB.prepare(
        `SELECT id, organisation_id, email, phone, normalised_email, normalised_phone
         FROM contacts WHERE id = ?`,
      )
        .bind(input.id)
        .first<{
          id: string;
          organisation_id: string | null;
          email: string | null;
          phone: string | null;
          normalised_email: string | null;
          normalised_phone: string | null;
        }>()
    : null;
  if (!contact && email) {
    contact = await current.DB.prepare(
      `SELECT id, organisation_id, email, phone, normalised_email, normalised_phone
       FROM contacts WHERE normalised_email = ?`,
    )
      .bind(email)
      .first<{
        id: string;
        organisation_id: string | null;
        email: string | null;
        phone: string | null;
        normalised_email: string | null;
        normalised_phone: string | null;
      }>();
  }
  if (!contact && phone) {
    contact = await current.DB.prepare(
      `SELECT id, organisation_id, email, phone, normalised_email, normalised_phone
       FROM contacts WHERE normalised_phone = ?`,
    )
      .bind(phone)
      .first<{
        id: string;
        organisation_id: string | null;
        email: string | null;
        phone: string | null;
        normalised_email: string | null;
        normalised_phone: string | null;
      }>();
  }
  const currentTime = nowIso();
  let organisationId = contact?.organisation_id ?? null;
  if (company) {
    const organisation = await current.DB.prepare(
      `SELECT id FROM organisations WHERE lower(name) = lower(?)`,
    )
      .bind(company)
      .first<{ id: string }>();
    organisationId = organisation?.id ?? id();
    if (!organisation) {
      await current.DB.prepare(
        `INSERT INTO organisations (id, name, created_at, updated_at) VALUES (?, ?, ?, ?)`,
      )
        .bind(organisationId, company, currentTime, currentTime)
        .run();
    }
  }
  if (contact) {
    await current.DB.prepare(
      `UPDATE contacts
       SET name = ?, organisation_id = ?, email = ?, phone = ?, normalised_email = ?, normalised_phone = ?, updated_at = ?
       WHERE id = ?`,
    )
      .bind(
        input.name || "Customer",
        organisationId,
        email || contact.email,
        input.phone || contact.phone,
        email || contact.normalised_email,
        phone || contact.normalised_phone,
        currentTime,
        contact.id,
      )
      .run();
    return contact.id;
  }
  const contactId = id();
  await current.DB.prepare(
    `INSERT INTO contacts (id, organisation_id, name, email, phone, normalised_email, normalised_phone, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  )
    .bind(
      contactId,
      organisationId,
      input.name || "Customer",
      email || null,
      input.phone || null,
      email || null,
      phone || null,
      currentTime,
      currentTime,
    )
    .run();
  return contactId;
}

async function enquiryBelongsToContact(
  enquiryId: string | undefined,
  contactId: string,
): Promise<boolean> {
  if (!enquiryId) return true;
  const enquiry = await runtimeEnv()
    .DB.prepare(`SELECT id FROM enquiries WHERE id = ? AND contact_id = ?`)
    .bind(enquiryId, contactId)
    .first<{ id: string }>();
  return Boolean(enquiry);
}

async function recordActivity(input: {
  contactId?: string;
  enquiryId?: string;
  actorId?: string;
  eventType: string;
  summary: string;
  metadata?: unknown;
}): Promise<void> {
  await runtimeEnv()
    .DB.prepare(
      `INSERT INTO activity_events (id, contact_id, enquiry_id, actor_id, event_type, summary, metadata_json, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    )
    .bind(
      id(),
      input.contactId ?? null,
      input.enquiryId ?? null,
      input.actorId ?? null,
      input.eventType,
      input.summary,
      input.metadata ? json(input.metadata) : null,
      nowIso(),
    )
    .run();
}

async function staffRecipients(eventType: string): Promise<string[]> {
  const current = runtimeEnv();
  const result = await current.DB.prepare(
    `SELECT recipient_email FROM notification_rules WHERE event_type = ? AND active = 1`,
  )
    .bind(eventType)
    .all<{ recipient_email: string }>();
  const configured = result.results
    .map((row: { recipient_email: string }) => row.recipient_email)
    .filter(Boolean);
  return configured.length
    ? configured
    : [current.STAFF_NOTIFICATION_EMAIL || "service@mackayrefrig.com.au"];
}

async function notifyStaff(input: {
  eventType: string;
  subject: string;
  lines: string[];
  contactId?: string;
  enquiryId?: string;
  waitUntil?: ExecutionContext["waitUntil"];
}): Promise<void> {
  for (const recipient of await staffRecipients(input.eventType)) {
    const communicationId = await createCommunication({
      contactId: input.contactId,
      enquiryId: input.enquiryId,
      template: input.eventType,
      to: recipient,
      subject: input.subject,
      text: emailText(input.lines),
      html: emailHtml(input.lines),
    });
    await scheduleCommunication(communicationId, input.waitUntil);
  }
}

export const server = {
  auth: {
    requestLogin: defineAction({
      accept: "form",
      input: loginInput,
      handler: async ({ email }, context) => {
        const normalised = normaliseEmail(email);
        const loginIpAllowed = await withinRateLimit({
          scope: "crm-login-ip",
          key: requestIp(context.request),
          limit: 10,
          windowMs: 15 * 60 * 1000,
        });
        const loginEmailAllowed = await withinRateLimit({
          scope: "crm-login-email",
          key: normalised,
          limit: 3,
          windowMs: 15 * 60 * 1000,
        });
        const current = runtimeEnv();
        const user =
          loginIpAllowed && loginEmailAllowed
            ? await current.DB.prepare(
                `SELECT id, name, email FROM staff_users
                 WHERE lower(email) = ? AND active = 1`,
              )
                .bind(normalised)
                .first<{ id: string; name: string; email: string }>()
            : null;
        if (user) {
          const token = await createLoginToken(user.id);
          const loginUrl = `${publicBaseUrl(context.request)}/crm/auth?token=${encodeURIComponent(token)}`;
          const communicationId = await createCommunication({
            template: "staff-login",
            to: user.email,
            subject: "Your Mackay Refrigeration CRM login link",
            text: emailText([
              `Hi ${user.name},`,
              "Use this one-time link to sign in to the Mackay Refrigeration CRM:",
              loginUrl,
              "The link expires in 15 minutes and can only be used once.",
            ]),
            html: emailHtml([
              `Hi ${user.name},`,
              "Use this one-time link to sign in to the Mackay Refrigeration CRM:",
              loginUrl,
              "The link expires in 15 minutes and can only be used once.",
            ]),
          });
          await scheduleCommunication(
            communicationId,
            context.locals.cfContext?.waitUntil?.bind(context.locals.cfContext),
          );
        }
        return { success: true };
      },
    }),
  },
  forms: {
    submit: defineAction({
      accept: "form",
      input: z.any(),
      handler: async (input, context) => {
        const data = dataObject(input);
        if (firstValue(data.website))
          return { success: true, formType: firstValue(data.form_type) };
        const formType = firstValue(data.form_type);
        const submissionAllowed = await withinRateLimit({
          scope: formType === "contact" ? "contact-form" : "secure-form",
          key: requestIp(context.request),
          limit: formType === "contact" ? 10 : 20,
          windowMs: 15 * 60 * 1000,
        });
        if (!submissionAllowed) {
          return {
            success: false,
            formType,
            errors: {
              _form:
                "Too many attempts. Please wait a few minutes and try again.",
            },
          };
        }
        if (!(await validateTurnstile(context.request, data))) {
          return {
            success: false,
            errors: {
              _form: "Please complete the verification and try again.",
            },
          };
        }

        const formEntry = await getEntry("forms", formType);
        if (!formEntry || !formKinds.safeParse(formType).success) {
          throw new ActionError({
            code: "BAD_REQUEST",
            message: "This form is not available.",
          });
        }
        const validation = validateForm(data, formEntry);
        if (Object.keys(validation.errors).length) {
          return {
            success: false,
            formType,
            errors: validation.errors,
            values: validation.values,
          };
        }

        const current = runtimeEnv();
        const token = firstValue(data.invite_token);
        let invite: {
          id: string;
          contact_id: string;
          enquiry_id: string | null;
        } | null = null;
        if (formType !== "contact") {
          if (!token)
            return {
              success: false,
              formType,
              errors: { _form: "This secure form link is missing or invalid." },
            };
          invite = await current.DB.prepare(
            `SELECT id, contact_id, enquiry_id FROM form_invites
             WHERE form_slug = ? AND token_hash = ? AND completed_at IS NULL AND revoked_at IS NULL AND expires_at > ?`,
          )
            .bind(formType, await hashSecret(token), nowIso())
            .first<{
              id: string;
              contact_id: string;
              enquiry_id: string | null;
            }>();
          if (!invite)
            return {
              success: false,
              formType,
              errors: {
                _form:
                  "This secure form link has expired or already been completed.",
              },
            };
        }

        const values = validation.values;
        const contactId = await upsertContact({
          id: invite?.contact_id,
          name:
            firstValue(values.name || values.full_name || values.hirer_name) ||
            "Customer",
          email: firstValue(values.email || values.hirer_email),
          phone: firstValue(values.phone || values.hirer_phone),
          company: firstValue(values.company || values.hirer_company),
        });
        let enquiryId = invite?.enquiry_id ?? null;
        if (!enquiryId) {
          enquiryId = id();
          await current.DB.prepare(
            `INSERT INTO enquiries (id, contact_id, source, service, message, urgency, status, created_at, updated_at)
             VALUES (?, ?, 'website', ?, ?, ?, 'new', ?, ?)`,
          )
            .bind(
              enquiryId,
              contactId,
              firstValue(
                values.service || values.service_type || values.equipment,
              ) || formType,
              firstValue(
                values.message ||
                  values.equipment_details ||
                  values.access_notes,
              ),
              firstValue(values.urgent) === "yes" ? "urgent" : "standard",
              nowIso(),
              nowIso(),
            )
            .run();
        } else {
          await current.DB.prepare(
            `UPDATE enquiries SET updated_at = ? WHERE id = ?`,
          )
            .bind(nowIso(), enquiryId)
            .run();
        }

        const submissionId = id();
        await current.DB.prepare(
          `INSERT INTO form_submissions
            (id, form_slug, form_version, form_snapshot, values_json, contact_id, enquiry_id, invite_id, source, ip_hash, user_agent, created_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        )
          .bind(
            submissionId,
            formType,
            formEntry.data.version,
            json(formEntry.data),
            json(values),
            contactId,
            enquiryId,
            invite?.id ?? null,
            invite ? "invite" : "website",
            await hashIp(context.request),
            context.request.headers.get("User-Agent")?.slice(0, 500) || null,
            nowIso(),
          )
          .run();

        if (invite) {
          await current.DB.prepare(
            `UPDATE form_invites SET completed_at = ? WHERE id = ?`,
          )
            .bind(nowIso(), invite.id)
            .run();
        }
        await recordActivity({
          contactId,
          enquiryId,
          eventType: "form_submitted",
          summary: `${formEntry.data.title} submitted`,
          metadata: { submissionId, formType, version: formEntry.data.version },
        });

        const lines = [
          `${formEntry.data.title} received from ${firstValue(values.name || values.full_name || values.hirer_name) || "a customer"}.`,
          `Form: ${formType} (${formEntry.data.version})`,
          `Email: ${firstValue(values.email || values.hirer_email)}`,
          `Phone: ${firstValue(values.phone || values.hirer_phone)}`,
          `Service: ${firstValue(values.service || values.service_type || values.equipment)}`,
          `Details: ${firstValue(values.message || values.equipment_details || values.access_notes)}`,
          `CRM contact: ${publicBaseUrl(context.request)}/crm/contacts/${contactId}`,
        ];
        const waitUntil = context.locals.cfContext?.waitUntil?.bind(
          context.locals.cfContext,
        );
        await notifyStaff({
          eventType: "form_submitted",
          subject: `${formEntry.data.title}: ${firstValue(values.name || values.full_name || values.hirer_name) || "new customer"}`,
          lines,
          contactId,
          enquiryId,
          waitUntil,
        });

        const customerEmail = firstValue(values.email || values.hirer_email);
        if (customerEmail) {
          const communicationId = await createCommunication({
            contactId,
            enquiryId,
            template: `${formType}-confirmation`,
            to: customerEmail,
            subject: formEntry.data.confirmationTitle,
            text: emailText([
              `Hi ${firstValue(values.name || values.full_name || values.hirer_name) || "there"},`,
              formEntry.data.confirmationMessage,
              "Mackay Refrigeration",
            ]),
            html: emailHtml([
              `Hi ${firstValue(values.name || values.full_name || values.hirer_name) || "there"},`,
              formEntry.data.confirmationMessage,
              "Mackay Refrigeration",
            ]),
          });
          await scheduleCommunication(communicationId, waitUntil);
        }

        return { success: true, formType, submissionId };
      },
    }),
  },
  staff: {
    createEnquiry: defineAction({
      accept: "form",
      input: phoneEnquiryInput,
      handler: async (input, context) => {
        const user = context.locals.user;
        if (!user || user.role === "readonly")
          throw new ActionError({
            code: "UNAUTHORIZED",
            message: "Sign in required.",
          });
        const contactId = await upsertContact(input);
        const enquiryId = id();
        const current = runtimeEnv();
        await current.DB.prepare(
          `INSERT INTO enquiries (id, contact_id, source, service, message, urgency, status, created_at, updated_at)
           VALUES (?, ?, 'phone', ?, ?, ?, 'new', ?, ?)`,
        )
          .bind(
            enquiryId,
            contactId,
            input.service || null,
            input.message || null,
            input.urgency,
            nowIso(),
            nowIso(),
          )
          .run();
        await recordActivity({
          contactId,
          enquiryId,
          actorId: user.id,
          eventType: "enquiry_created",
          summary: "Phone enquiry recorded",
        });
        await notifyStaff({
          eventType: "enquiry_created",
          subject: `Phone enquiry: ${input.name}`,
          lines: [
            `Phone enquiry from ${input.name}.`,
            `Phone: ${input.phone}`,
            `Service: ${input.service || "Not specified"}`,
            `Details: ${input.message || "No notes"}`,
          ],
          contactId,
          enquiryId,
          waitUntil: context.locals.cfContext?.waitUntil?.bind(
            context.locals.cfContext,
          ),
        });
        return { success: true, contactId, enquiryId };
      },
    }),
    sendInvite: defineAction({
      accept: "form",
      input: inviteInput,
      handler: async (input, context) => {
        const user = context.locals.user;
        if (!user || user.role === "readonly")
          throw new ActionError({
            code: "UNAUTHORIZED",
            message: "Sign in required.",
          });
        const current = runtimeEnv();
        const contact = await current.DB.prepare(
          `SELECT id, name, email FROM contacts WHERE id = ?`,
        )
          .bind(input.contactId)
          .first<{ id: string; name: string; email: string | null }>();
        if (!contact?.email)
          return {
            success: false,
            message:
              "This contact needs an email address before a form can be sent.",
          };
        if (!(await enquiryBelongsToContact(input.enquiryId, contact.id))) {
          throw new ActionError({
            code: "BAD_REQUEST",
            message: "That enquiry does not belong to this contact.",
          });
        }
        const token = randomToken();
        const inviteId = id();
        const expiresAt = new Date(Date.now() + 14 * 86400000).toISOString();
        const inviteTime = nowIso();
        const enquiryId = input.enquiryId ?? null;
        await current.DB.batch([
          current.DB.prepare(
            `UPDATE form_invites SET revoked_at = ?
               WHERE form_slug = ? AND contact_id = ? AND enquiry_id IS ?
                 AND completed_at IS NULL AND revoked_at IS NULL`,
          ).bind(inviteTime, input.formType, contact.id, enquiryId),
          current.DB.prepare(
            `INSERT INTO form_invites (id, form_slug, contact_id, enquiry_id, token_hash, sent_by, expires_at, created_at)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          ).bind(
            inviteId,
            input.formType,
            contact.id,
            enquiryId,
            await hashSecret(token),
            user.id,
            expiresAt,
            inviteTime,
          ),
        ]);
        const link = `${publicBaseUrl(context.request)}/forms/${input.formType}?token=${encodeURIComponent(token)}`;
        const title =
          input.formType === "hire-contract"
            ? "Hire contract"
            : "Service supply form";
        if (contact.id.startsWith("demo-")) {
          await recordActivity({
            contactId: contact.id,
            enquiryId: input.enquiryId,
            actorId: user.id,
            eventType: "form_invited",
            summary: `Demo ${title.toLowerCase()} prepared; no email sent`,
          });
          return { success: true, inviteId, demo: true };
        }
        const communicationId = await createCommunication({
          contactId: contact.id,
          enquiryId: input.enquiryId,
          template: "form-invite",
          to: contact.email,
          subject: `Mackay Refrigeration — ${title}`,
          text: emailText([
            `Hi ${contact.name},`,
            `Please complete the Mackay Refrigeration ${title.toLowerCase()} here:`,
            link,
            "This link expires in 14 days.",
          ]),
          html: emailHtml([
            `Hi ${contact.name},`,
            `Please complete the Mackay Refrigeration ${title.toLowerCase()} here:`,
            link,
            "This link expires in 14 days.",
          ]),
        });
        await scheduleCommunication(
          communicationId,
          context.locals.cfContext?.waitUntil?.bind(context.locals.cfContext),
        );
        await recordActivity({
          contactId: contact.id,
          enquiryId: input.enquiryId,
          actorId: user.id,
          eventType: "form_invited",
          summary: `${title} sent to ${contact.email}`,
        });
        return { success: true, inviteId };
      },
    }),
    addNote: defineAction({
      accept: "form",
      input: noteInput,
      handler: async (input, context) => {
        const user = context.locals.user;
        if (!user || user.role === "readonly")
          throw new ActionError({
            code: "UNAUTHORIZED",
            message: "Sign in required.",
          });
        if (
          !(await enquiryBelongsToContact(input.enquiryId, input.contactId))
        ) {
          throw new ActionError({
            code: "BAD_REQUEST",
            message: "That enquiry does not belong to this contact.",
          });
        }
        await runtimeEnv()
          .DB.prepare(
            `INSERT INTO notes (id, contact_id, enquiry_id, author_id, body, created_at) VALUES (?, ?, ?, ?, ?, ?)`,
          )
          .bind(
            id(),
            input.contactId,
            input.enquiryId ?? null,
            user.id,
            input.body,
            nowIso(),
          )
          .run();
        await recordActivity({
          contactId: input.contactId,
          enquiryId: input.enquiryId,
          actorId: user.id,
          eventType: "note_added",
          summary: "Staff note added",
        });
        return { success: true };
      },
    }),
    updateStatus: defineAction({
      accept: "form",
      input: statusInput,
      handler: async (input, context) => {
        const user = context.locals.user;
        if (!user || user.role === "readonly")
          throw new ActionError({
            code: "UNAUTHORIZED",
            message: "Sign in required.",
          });
        const current = runtimeEnv();
        const enquiry = await current.DB.prepare(
          `SELECT contact_id FROM enquiries WHERE id = ?`,
        )
          .bind(input.enquiryId)
          .first<{ contact_id: string }>();
        if (!enquiry)
          throw new ActionError({
            code: "BAD_REQUEST",
            message: "That enquiry no longer exists.",
          });
        await current.DB.prepare(
          `UPDATE enquiries SET status = ?, updated_at = ? WHERE id = ?`,
        )
          .bind(input.status, nowIso(), input.enquiryId)
          .run();
        await recordActivity({
          contactId: enquiry?.contact_id,
          enquiryId: input.enquiryId,
          actorId: user.id,
          eventType: "status_changed",
          summary: `Enquiry moved to ${input.status}`,
        });
        return { success: true };
      },
    }),
    updateFormWorkflow: defineAction({
      accept: "form",
      input: formWorkflowInput,
      handler: async (input, context) => {
        const user = context.locals.user;
        if (!user || user.role === "readonly")
          throw new ActionError({
            code: "UNAUTHORIZED",
            message: "Sign in required.",
          });
        const current = runtimeEnv();
        const submission = await current.DB.prepare(
          `SELECT form_slug, contact_id, enquiry_id
           FROM form_submissions WHERE id = ?`,
        )
          .bind(input.submissionId)
          .first<{
            form_slug: string;
            contact_id: string | null;
            enquiry_id: string | null;
          }>();
        if (!submission || !isManagedFormSlug(submission.form_slug)) {
          throw new ActionError({
            code: "BAD_REQUEST",
            message: "That form submission no longer exists.",
          });
        }
        if (
          !formWorkflowMeta[submission.form_slug].statuses.includes(
            input.status,
          )
        ) {
          throw new ActionError({
            code: "BAD_REQUEST",
            message: "That status is not available for this form type.",
          });
        }
        const updatedAt = nowIso();
        await current.DB.prepare(
          `UPDATE form_submissions
           SET workflow_status = ?, due_at = ?,
               reviewed_at = CASE
                 WHEN ? = 'received' THEN NULL
                 ELSE COALESCE(reviewed_at, ?)
               END,
               reviewed_by = CASE
                 WHEN ? = 'received' THEN NULL
                 ELSE COALESCE(reviewed_by, ?)
               END
           WHERE id = ?`,
        )
          .bind(
            input.status,
            input.dueAt ? `${input.dueAt}T23:59:59.000Z` : null,
            input.status,
            updatedAt,
            input.status,
            user.id,
            input.submissionId,
          )
          .run();
        await recordActivity({
          contactId: submission.contact_id ?? undefined,
          enquiryId: submission.enquiry_id ?? undefined,
          actorId: user.id,
          eventType: "form_workflow_updated",
          summary: `${formTitle(submission.form_slug)} moved to ${displayStatus(input.status)}`,
          metadata: {
            submissionId: input.submissionId,
            status: input.status,
            dueAt: input.dueAt || null,
          },
        });
        return { success: true };
      },
    }),
    saveNotificationRule: defineAction({
      accept: "form",
      input: notificationRuleInput,
      handler: async (input, context) => {
        const user = context.locals.user;
        if (!user || user.role !== "admin")
          throw new ActionError({
            code: "UNAUTHORIZED",
            message: "Administrator access required.",
          });
        const current = runtimeEnv();
        const recipientEmail = normaliseEmail(input.recipientEmail);
        await current.DB.prepare(
          `INSERT INTO notification_rules (id, event_type, recipient_email, active, created_at, updated_at)
           VALUES (?, ?, ?, 1, ?, ?)
           ON CONFLICT(event_type, recipient_email) DO UPDATE SET active = 1, updated_at = excluded.updated_at`,
        )
          .bind(id(), input.eventType, recipientEmail, nowIso(), nowIso())
          .run();
        await current.DB.prepare(
          `INSERT INTO audit_events (id, actor_id, action, entity_type, entity_id, metadata_json, created_at)
           VALUES (?, ?, 'notification_rule_saved', 'notification_rule', NULL, ?, ?)`,
        )
          .bind(
            id(),
            user.id,
            json({ eventType: input.eventType, recipientEmail }),
            nowIso(),
          )
          .run();
        return { success: true };
      },
    }),
    removeNotificationRule: defineAction({
      accept: "form",
      input: removeNotificationRuleInput,
      handler: async ({ id: ruleId }, context) => {
        const user = context.locals.user;
        if (!user || user.role !== "admin")
          throw new ActionError({
            code: "UNAUTHORIZED",
            message: "Administrator access required.",
          });
        await runtimeEnv()
          .DB.prepare(
            `UPDATE notification_rules SET active = 0, updated_at = ? WHERE id = ?`,
          )
          .bind(nowIso(), ruleId)
          .run();
        await runtimeEnv()
          .DB.prepare(
            `INSERT INTO audit_events (id, actor_id, action, entity_type, entity_id, metadata_json, created_at)
           VALUES (?, ?, 'notification_rule_removed', 'notification_rule', ?, NULL, ?)`,
          )
          .bind(id(), user.id, ruleId, nowIso())
          .run();
        return { success: true };
      },
    }),
  },
};
