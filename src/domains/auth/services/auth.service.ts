import { supabase } from "@/integrations/supabase/client";

/** Auth domain service: the only place that talks to the auth backend. */
export const authService = {
  signIn(email: string, password: string) {
    return supabase.auth.signInWithPassword({ email, password });
  },

  signUp(email: string, password: string) {
    return supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: window.location.origin },
    });
  },

  requestPasswordReset(email: string) {
    return supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
  },

  updatePassword(password: string) {
    return supabase.auth.updateUser({ password });
  },

  signOut() {
    return supabase.auth.signOut();
  },
};
