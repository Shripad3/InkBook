import { z } from "zod";

export const sessionTypeSchema = z.object({
  name: z.string().min(1, "Name is required"),
  duration_minutes: z.number().min(30, "Minimum 30 minutes").max(600, "Maximum 10 hours"),
  buffer_minutes: z.number().min(0).max(120),
  price_from: z.number().min(0).nullable(),
  price_to: z.number().min(0).nullable(),
  deposit_type: z.enum(["fixed", "percentage"]),
  deposit_value: z.number().min(0),
  requires_consultation: z.boolean(),
  requires_reference_image: z.boolean(),
  min_notice_hours: z.number().min(0).max(720),
  max_advance_days: z.number().min(1).max(365),
  description: z.string().optional(),
}).refine(
  (d) => !d.price_from || !d.price_to || d.price_to >= d.price_from,
  { message: "Max price must be ≥ min price", path: ["price_to"] }
);

export type SessionTypeInput = z.infer<typeof sessionTypeSchema>;
