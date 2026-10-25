import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { validateConversation } from "@/lib/ai/assistant-policy";

const messageSchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string().trim().min(1).max(600),
});

const askSchema = z
  .object({
    requestId: z.string().uuid(),
    messages: z.array(messageSchema).min(1).max(8),
    locale: z.enum(["fr", "en"]).default("fr"),
    route: z.string().max(200).optional(),
  })
  .superRefine((value, context) => {
    const error = validateConversation(value);
    if (error) context.addIssue({ code: z.ZodIssueCode.custom, message: error });
  });

export const askAssistant = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(askSchema)
  .handler(async ({ data, context }) => {
    const { runPaidAssistant } = await import("@/lib/ai/assistant.server");
    return runPaidAssistant(context.supabase as never, context.userId, data);
  });
