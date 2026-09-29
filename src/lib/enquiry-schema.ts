import { z } from "zod";

export const enquiryTypes = [
  { value: "stay", label: "Book a stay" },
  { value: "list-property", label: "List my property" },
  { value: "general", label: "General enquiry" },
] as const;

export const enquirySchema = z.object({
  name: z.string().trim().min(2, "Enter your full name").max(120),
  email: z.string().trim().min(1, "Enter your email").email("Enter a valid email address"),
  phone: z
    .string()
    .trim()
    .min(6, "Enter a valid phone number")
    .max(20, "Enter a valid phone number"),
  enquiryType: z.enum(["stay", "list-property", "general"]),
  message: z.string().trim().min(10, "Tell us a little more (10 characters minimum)").max(2000),
  // Optional context carried silently from wherever the form was opened.
  propertySlug: z.string().optional(),
  source: z.string().optional(),
});

export type EnquiryInput = z.infer<typeof enquirySchema>;
