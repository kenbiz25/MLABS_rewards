import { z } from "zod";
import { TRAIT_KEYS } from "./traits";
import { PARTICIPATING_COUNTRIES } from "./countries";

const countryCodes = PARTICIPATING_COUNTRIES.map((c) => c.code) as [string, ...string[]];

// Nominating (as opposed to signing in generally) is restricted to
// Medtronic work email domains.
const ALLOWED_NOMINATOR_DOMAINS = ["medtroniclabs.org", "medtronic.com"];

export const nominatorEmailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .email("Enter a valid work email.")
  .refine(
    (email) => ALLOWED_NOMINATOR_DOMAINS.some((domain) => email.endsWith(`@${domain}`)),
    "Use your @medtroniclabs.org or @medtronic.com work email to nominate."
  );

export const identitySchema = z.object({
  nominatorName: z
    .string()
    .trim()
    .min(2, "Enter your full name.")
    .max(120, "That name looks too long."),
  nominatorEmail: nominatorEmailSchema,
});

export type IdentityInput = z.infer<typeof identitySchema>;

export const nominationSchema = z.object({
  nominatorName: identitySchema.shape.nominatorName,
  nominatorEmail: identitySchema.shape.nominatorEmail,
  nomineeName: z
    .string()
    .trim()
    .min(2, "Enter the nominee's name.")
    .max(120, "That name looks too long."),
  countryCode: z.enum(countryCodes, {
    errorMap: () => ({ message: "Select the nominee's country." }),
  }),
  traits: z
    .array(z.enum(TRAIT_KEYS))
    .min(1, "Select at least one Core Trait."),
  momentText: z
    .string()
    .trim()
    .min(200, "Say a bit more - at least 200 characters.")
    .max(1500, "Keep it under 1500 characters."),
  impactText: z
    .string()
    .trim()
    .min(100, "Say a bit more - at least 100 characters.")
    .max(1500, "Keep it under 1500 characters."),
  // Honeypot: must stay empty. Bots that fill every field trip this.
  companyWebsite: z.string().max(0).optional().or(z.literal("")),
});

export type NominationInput = z.infer<typeof nominationSchema>;

// Lets an admin pre-provision an account (e.g. a new admin who hasn't
// signed in with Microsoft yet) ahead of their first sign-in. No password —
// the account authenticates via Microsoft SSO, matched by email.
export const createUserSchema = z.object({
  name: z.string().trim().min(2).max(120),
  email: z.string().trim().toLowerCase().email("Enter a valid email."),
  isAdmin: z.boolean().optional(),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;

export const updateUserRoleSchema = z.object({
  isAdmin: z.boolean(),
});

export type UpdateUserRoleInput = z.infer<typeof updateUserRoleSchema>;

const dateStringSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Use a valid date.");

export const cycleSchema = z.object({
  name: z.string().trim().min(2).max(80),
  startDate: dateStringSchema,
  durationDays: z.number().int().min(1).max(120).optional(),
});

export type CycleInput = z.infer<typeof cycleSchema>;

export const cycleUpdateSchema = z.object({
  name: z.string().trim().min(2).max(80).optional(),
  startDate: dateStringSchema.optional(),
  durationDays: z.number().int().min(1).max(120).optional(),
  status: z.enum(["DRAFT", "OPEN", "CLOSED"]).optional(),
  resultsPublished: z.boolean().optional(),
});

export type CycleUpdateInput = z.infer<typeof cycleUpdateSchema>;

export const winnerSchema = z.object({
  nomineeName: z.string().trim().min(2).max(120),
  trait: z.enum(TRAIT_KEYS, { errorMap: () => ({ message: "Select a Core Trait category." }) }),
});

export type WinnerInput = z.infer<typeof winnerSchema>;
