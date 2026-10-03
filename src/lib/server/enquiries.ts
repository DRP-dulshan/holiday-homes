import "server-only";
import { enquiryTypes, type EnquiryInput } from "@/lib/enquiry-schema";
import { getProperty } from "@/data/properties";
import { newId } from "./crypto";
import { absoluteUrl, sendMail, teamInbox } from "./mailer";
import { mutate, readAll } from "./store";
import { site } from "@/config/site";

export type Enquiry = Omit<EnquiryInput, "company"> & {
  id: string;
  status: "new" | "handled";
  createdAt: string;
  handledAt?: string;
};

const ENQUIRIES = "enquiries";

export async function createEnquiry(input: EnquiryInput) {
  // Strip the honeypot field before saving.
  const { company: _company, ...data } = input;
  void _company;
  const enquiry = await mutate<Enquiry, Enquiry>(ENQUIRIES, (rows) => {
    const row: Enquiry = {
      ...data,
      id: newId(),
      status: "new",
      createdAt: new Date().toISOString(),
    };
    rows.push(row);
    return row;
  });

  const typeLabel = enquiryTypes.find((t) => t.value === enquiry.enquiryType)?.label ?? "Enquiry";
  const property = enquiry.propertySlug ? getProperty(enquiry.propertySlug) : undefined;

  await Promise.all([
    sendMail({
      to: enquiry.enquiryType === "list-property" ? site.ownersEmail : teamInbox(),
      subject: `${typeLabel}: ${enquiry.name}${property ? ` — ${property.title}` : ""}`,
      replyTo: enquiry.email,
      text: `New website enquiry (${typeLabel}).

Name: ${enquiry.name}
Email: ${enquiry.email}
Phone: ${enquiry.phone}${property ? `\nProperty: ${property.title}, ${property.area}` : ""}
Source: ${enquiry.source ?? "website"}

${enquiry.message}

Dashboard: ${absoluteUrl("/admin/enquiries")}`,
    }),
    sendMail({
      to: enquiry.email,
      subject: `We've received your message — ${site.name}`,
      replyTo: site.email,
      text: `Hi ${enquiry.name},

Thanks for getting in touch with ${site.name}. A member of the team will reply within a few hours during office hours.

Your message:
${enquiry.message}

If it's urgent, call ${site.phoneDisplay} or WhatsApp ${site.whatsappNumber}.`,
    }),
  ]);

  return enquiry;
}

export async function listEnquiries() {
  const rows = await readAll<Enquiry>(ENQUIRIES);
  return rows.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function setEnquiryStatus(id: string, status: Enquiry["status"]) {
  return mutate<Enquiry, boolean>(ENQUIRIES, (rows) => {
    const row = rows.find((r) => r.id === id);
    if (!row) return false;
    row.status = status;
    row.handledAt = status === "handled" ? new Date().toISOString() : undefined;
    return true;
  });
}

export async function deleteEnquiry(id: string) {
  return mutate<Enquiry, boolean>(ENQUIRIES, (rows) => {
    const i = rows.findIndex((r) => r.id === id);
    if (i === -1) return false;
    rows.splice(i, 1);
    return true;
  });
}
