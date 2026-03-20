import { z } from "zod";

export const bookingFormSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Enter a valid email"),
  phone: z.string().min(7, "Enter a valid phone number"),
  placement: z.string().min(1, "Placement is required (e.g. left forearm)"),
  sizeEstimate: z.enum(["tiny", "small", "medium", "large"], {
    required_error: "Please select a size",
  }),
  styleDescription: z.string().min(10, "Please describe your tattoo idea (min 10 chars)"),
  isCoverup: z.boolean(),
  coverupDescription: z.string().optional(),
  medicalNotes: z.string().optional(),
  ageConfirmed: z.boolean().refine((v) => v, "You must confirm you are 18+"),
  cancellationAgreed: z.boolean().refine((v) => v, "You must agree to the cancellation policy"),
}).superRefine((d, ctx) => {
  if (d.isCoverup && !d.coverupDescription) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Please describe the existing tattoo",
      path: ["coverupDescription"],
    });
  }
});

export type BookingFormInput = z.infer<typeof bookingFormSchema>;
